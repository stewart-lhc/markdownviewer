"use client";

import { FormEvent, useEffect, useState } from "react";
import { trackProductEvent } from "@/lib/analytics/product-events";
import type { Locale } from "@/lib/i18n/locales";
import type { WaitlistInterest } from "@/lib/waitlist/waitlist-store";

type PricingWaitlistFormProps = {
  buttonLabel: string;
  interest: WaitlistInterest;
  locale: Locale;
};

type FormState = "idle" | "submitting" | "success" | "error";

export function PricingWaitlistForm({ buttonLabel, interest, locale }: PricingWaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [intent, setIntent] = useState("pricing_card");
  const [source, setSource] = useState("pricing");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIntent(params.get("intent") || "pricing_card");
    setSource(params.get("source") || "pricing");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("submitting");
    setMessage("");
    trackProductEvent("waitlist_submit_started", { interest, intent, source });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          interest,
          intent,
          locale,
          source
        })
      });
      const payload = (await response.json().catch(() => null)) as {
        emailSent?: boolean;
        error?: string;
        status?: "pending" | "email_failed" | "verified";
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to join the waitlist.");
      }

      setFormState("success");
      setMessage(
        locale === "zh-CN"
          ? payload?.status === "verified"
            ? "这个邮箱已经在 verified waitlist。"
            : payload?.emailSent
            ? "确认邮件已发送，请点击邮件里的链接完成验证。"
            : "已加入 waitlist。邮件配置完成后我们会发送确认。"
          : payload?.status === "verified"
            ? "This email is already on the verified waitlist."
            : payload?.emailSent
            ? "Confirmation email sent. Click the link in the email to verify your address."
            : "You are on the waitlist. Confirmation email will be sent after email is configured."
      );
      trackProductEvent("waitlist_submit_success", { email_sent: Boolean(payload?.emailSent), interest, intent, source });
    } catch (error) {
      setFormState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : locale === "zh-CN"
            ? "加入 waitlist 失败。"
            : "Failed to join the waitlist."
      );
      trackProductEvent("waitlist_submit_failed", { interest, intent, source });
    }
  }

  return (
    <form className="pricing-waitlist-form" onSubmit={handleSubmit}>
      <label>
        <span>{locale === "zh-CN" ? "邮箱" : "Email"}</span>
        <input
          autoComplete="email"
          disabled={formState === "submitting" || formState === "success"}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={locale === "zh-CN" ? "you@example.com" : "you@example.com"}
          required
          type="email"
          value={email}
        />
      </label>
      <button className="button-primary" disabled={formState === "submitting" || formState === "success"} type="submit">
        {formState === "submitting" ? (locale === "zh-CN" ? "提交中..." : "Joining...") : buttonLabel}
      </button>
      {message ? (
        <p className="pricing-waitlist-form__message" data-state={formState} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
