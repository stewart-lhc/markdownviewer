export type CreateShareResult = {
  id: string;
  title: string;
};

export async function createShareViaApi(markdown: string, title?: string): Promise<CreateShareResult> {
  const response = await fetch("/api/share", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ markdown, title })
  });

  const payload = (await response.json().catch(() => null)) as Partial<CreateShareResult> & { error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error || "Failed to create share link.");
  }

  if (!payload || typeof payload.id !== "string" || typeof payload.title !== "string") {
    throw new Error("Share response was not valid.");
  }

  return {
    id: payload.id,
    title: payload.title
  };
}
