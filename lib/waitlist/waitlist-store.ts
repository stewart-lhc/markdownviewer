import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type WaitlistInterest = "share_pro" | "converter_api";

export type WaitlistSubscriberInput = {
  baseUrl: string;
  email: string;
  interest: WaitlistInterest;
  intent?: string;
  locale?: string;
  source?: string;
  userAgent?: string;
};

export type WaitlistStorageProvider = "cloudflare-d1" | "local-file";

export type WaitlistSubscriberResult = {
  email: string;
  emailSent: boolean;
  status: WaitlistStatus;
  storage: WaitlistStorageProvider;
};

export type WaitlistConfirmationResult = {
  email: string;
  status: "verified";
  storage: WaitlistStorageProvider;
};

export type WaitlistStatus = "pending" | "email_failed" | "verified";

type CloudflareD1QueryResult = {
  errors?: Array<{ message?: string }>;
  result?: Array<{ results?: Array<Record<string, unknown>> }>;
  success?: boolean;
};

const localWaitlistDirectory = path.join(process.cwd(), ".data", "waitlist");
const localWaitlistPath = path.join(localWaitlistDirectory, "subscribers.jsonl");

function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidWaitlistEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getCloudflareD1Config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;

  if (!accountId || !apiToken || !databaseId) {
    return null;
  }

  return { accountId, apiToken, databaseId };
}

function hashConfirmationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createConfirmationToken() {
  return randomBytes(32).toString("base64url");
}

function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

async function queryCloudflareD1(sql: string, params: unknown[] = []) {
  const config = getCloudflareD1Config();

  if (!config) {
    throw new Error("Cloudflare D1 is not configured.");
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ params, sql })
    }
  );
  const payload = (await response.json().catch(() => null)) as CloudflareD1QueryResult | null;

  if (!response.ok || payload?.success === false || !payload) {
    const message = payload?.errors?.[0]?.message || `Cloudflare D1 request failed with ${response.status}.`;
    throw new Error(message);
  }

  return payload;
}

async function ensureCloudflareD1Schema() {
  await queryCloudflareD1(`
    CREATE TABLE IF NOT EXISTS waitlist_subscribers (
      email TEXT PRIMARY KEY,
      interest TEXT NOT NULL,
      source TEXT,
      intent TEXT,
      locale TEXT,
      user_agent TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      confirmation_token_hash TEXT,
      email_sent_at TEXT,
      confirmed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await queryCloudflareD1(`ALTER TABLE waitlist_subscribers ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'`).catch(() => undefined);
  await queryCloudflareD1(`ALTER TABLE waitlist_subscribers ADD COLUMN confirmation_token_hash TEXT`).catch(() => undefined);
  await queryCloudflareD1(`ALTER TABLE waitlist_subscribers ADD COLUMN email_sent_at TEXT`).catch(() => undefined);
  await queryCloudflareD1(`ALTER TABLE waitlist_subscribers ADD COLUMN confirmed_at TEXT`).catch(() => undefined);
}

type NormalizedWaitlistSubscriberInput = {
  email: string;
  interest: WaitlistInterest;
  intent: string;
  locale: string;
  source: string;
  userAgent: string;
};

type PendingWaitlistRecord = NormalizedWaitlistSubscriberInput & {
  confirmationTokenHash: string;
  createdAt: string;
};

async function savePendingWithCloudflareD1(input: PendingWaitlistRecord) {
  await ensureCloudflareD1Schema();
  await queryCloudflareD1(
    `
      INSERT INTO waitlist_subscribers (
        email,
        interest,
        source,
        intent,
        locale,
        user_agent,
        status,
        confirmation_token_hash,
        email_sent_at,
        confirmed_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NULL, NULL, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        interest = excluded.interest,
        source = excluded.source,
        intent = excluded.intent,
        locale = excluded.locale,
        user_agent = excluded.user_agent,
        status = 'pending',
        confirmation_token_hash = excluded.confirmation_token_hash,
        email_sent_at = NULL,
        confirmed_at = NULL,
        updated_at = excluded.updated_at
    `,
    [
      input.email,
      input.interest,
      input.source,
      input.intent,
      input.locale,
      input.userAgent,
      input.confirmationTokenHash,
      input.createdAt,
      input.createdAt
    ]
  );
}

async function appendLocalWaitlistEvent(event: Record<string, unknown>) {
  await mkdir(localWaitlistDirectory, { recursive: true });
  await writeFile(
    localWaitlistPath,
    `${JSON.stringify(event)}\n`,
    { encoding: "utf8", flag: "a" }
  );
}

async function savePendingWithLocalFile(input: PendingWaitlistRecord) {
  await appendLocalWaitlistEvent({
    confirmationTokenHash: input.confirmationTokenHash,
    createdAt: input.createdAt,
    email: input.email,
    interest: input.interest,
    intent: input.intent,
    locale: input.locale,
    source: input.source,
    status: "pending",
    type: "waitlist_pending",
    userAgent: input.userAgent
  });
}

async function markEmailSentWithCloudflareD1(email: string, status: Exclude<WaitlistStatus, "verified">, emailSentAt: string | null) {
  await ensureCloudflareD1Schema();
  await queryCloudflareD1(
    `
      UPDATE waitlist_subscribers
      SET status = ?, email_sent_at = ?, updated_at = ?
      WHERE email = ?
    `,
    [status, emailSentAt, new Date().toISOString(), email]
  );
}

async function markEmailSentWithLocalFile(email: string, status: Exclude<WaitlistStatus, "verified">, emailSentAt: string | null) {
  await appendLocalWaitlistEvent({
    email,
    emailSentAt,
    status,
    type: "waitlist_email_status",
    updatedAt: new Date().toISOString()
  });
}

async function findLocalPendingRecordByToken(tokenHash: string) {
  let text = "";

  try {
    text = await readFile(localWaitlistPath, "utf8");
  } catch {
    return null;
  }

  const records = text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as Partial<PendingWaitlistRecord> & { status?: string; type?: string };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return records.find((record) => {
    if (record?.type !== "waitlist_pending" || typeof record.confirmationTokenHash !== "string") {
      return false;
    }

    return safeEqualHex(record.confirmationTokenHash, tokenHash);
  });
}

async function confirmWithCloudflareD1(tokenHash: string) {
  await ensureCloudflareD1Schema();
  const select = await queryCloudflareD1(
    `
      SELECT email
      FROM waitlist_subscribers
      WHERE confirmation_token_hash = ?
      LIMIT 1
    `,
    [tokenHash]
  );
  const email = select.result?.[0]?.results?.[0]?.email;

  if (typeof email !== "string") {
    return null;
  }

  const confirmedAt = new Date().toISOString();
  await queryCloudflareD1(
    `
      UPDATE waitlist_subscribers
      SET status = 'verified',
          confirmed_at = ?,
          updated_at = ?
      WHERE email = ?
    `,
    [confirmedAt, confirmedAt, email]
  );

  return email;
}

async function confirmWithLocalFile(tokenHash: string) {
  const record = await findLocalPendingRecordByToken(tokenHash);

  if (!record || typeof record.email !== "string") {
    return null;
  }

  await appendLocalWaitlistEvent({
    confirmedAt: new Date().toISOString(),
    email: record.email,
    status: "verified",
    type: "waitlist_verified"
  });

  return record.email;
}

function buildConfirmationUrl(baseUrl: string, token: string) {
  return `${baseUrl.replace(/\/+$/, "")}/api/waitlist/confirm?token=${encodeURIComponent(token)}`;
}

async function sendWaitlistConfirmation(input: NormalizedWaitlistSubscriberInput & { baseUrl: string; token: string }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return false;
  }

  const from = process.env.RESEND_FROM || "Markdownviewer <onboarding@resend.dev>";
  const productName = input.interest === "share_pro" ? "Share Pro" : "Converter API";
  const confirmationUrl = buildConfirmationUrl(input.baseUrl, input.token);
  const subject = `Confirm your Markdownviewer ${productName} waitlist email`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#172033">
      <h1 style="font-size:22px">Confirm your ${productName} waitlist email.</h1>
      <p>Thanks for telling us what you need from Markdownviewer. Click the button below to confirm this email address.</p>
      <p><a href="${confirmationUrl}" style="display:inline-block;border-radius:8px;background:#172033;color:#ffffff;padding:12px 16px;text-decoration:none">Confirm email</a></p>
      <p>If the button does not work, open this link:</p>
      <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>
      <p style="color:#5f6b7a">markdownviewer.run</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      html,
      subject,
      text: `Confirm your Markdownviewer ${productName} waitlist email: ${confirmationUrl}`,
      to: input.email
    })
  });

  if (!response.ok) {
    return false;
  }

  return true;
}

export async function addWaitlistSubscriber(input: WaitlistSubscriberInput): Promise<WaitlistSubscriberResult> {
  const email = normalizeEmail(input.email);

  if (!isValidWaitlistEmail(email)) {
    throw new Error("Enter a valid email address.");
  }

  const normalizedInput: NormalizedWaitlistSubscriberInput = {
    email,
    interest: input.interest,
    intent: input.intent?.slice(0, 80) || "unknown",
    locale: input.locale?.slice(0, 20) || "en",
    source: input.source?.slice(0, 80) || "pricing",
    userAgent: input.userAgent?.slice(0, 240) || "unknown"
  };
  const createdAt = new Date().toISOString();
  const token = createConfirmationToken();
  const confirmationTokenHash = hashConfirmationToken(token);
  let storage: WaitlistStorageProvider = "local-file";

  if (getCloudflareD1Config()) {
    await savePendingWithCloudflareD1({ ...normalizedInput, confirmationTokenHash, createdAt });
    storage = "cloudflare-d1";
  } else if (isVercelRuntime()) {
    throw new Error("Waitlist storage is not configured.");
  } else {
    await savePendingWithLocalFile({ ...normalizedInput, confirmationTokenHash, createdAt });
  }

  const emailSent = await sendWaitlistConfirmation({ ...normalizedInput, baseUrl: input.baseUrl, token });

  if (storage === "cloudflare-d1") {
    await markEmailSentWithCloudflareD1(email, emailSent ? "pending" : "email_failed", emailSent ? new Date().toISOString() : null);
  } else {
    await markEmailSentWithLocalFile(email, emailSent ? "pending" : "email_failed", emailSent ? new Date().toISOString() : null);
  }

  return {
    email,
    emailSent,
    status: emailSent ? "pending" : "email_failed",
    storage
  };
}

export async function confirmWaitlistSubscriber(token: string): Promise<WaitlistConfirmationResult> {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    throw new Error("Confirmation token is required.");
  }

  const tokenHash = hashConfirmationToken(trimmedToken);
  let storage: WaitlistStorageProvider = "local-file";
  let email: string | null;

  if (getCloudflareD1Config()) {
    email = await confirmWithCloudflareD1(tokenHash);
    storage = "cloudflare-d1";
  } else if (isVercelRuntime()) {
    throw new Error("Waitlist storage is not configured.");
  } else {
    email = await confirmWithLocalFile(tokenHash);
  }

  if (!email) {
    throw new Error("Confirmation link is invalid or expired.");
  }

  return {
    email,
    status: "verified",
    storage
  };
}
