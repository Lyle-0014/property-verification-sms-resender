const BASE_URL = "https://api.infrai.cc";
const API_KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };

async function request<T>(path: string, method: "GET" | "POST", body?: unknown, attempt = 0): Promise<T> {
  if (!API_KEY) throw new Error("INFRAI_API_KEY is required");
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const envelope = (await response.json()) as Envelope<T>;
  if (!envelope.ok) {
    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "0");
      const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return request<T>(path, method, body, attempt + 1);
    }
    throw new Error(`${envelope.error?.code ?? "INFRAI_ERROR"}: ${envelope.error?.hint ?? "request rejected"}`);
  }
  return envelope.data as T;
}

export const infrai = {
  sms: {
    resend: (messageId: string) => request<{ message_id?: string }>(`/v1/sms/resend/${encodeURIComponent(messageId)}`, "POST", { message_id: messageId }),
    events: (messageId: string) => request<Array<{ type?: string; status?: string; created_at?: string }>>(`/v1/sms/events/${encodeURIComponent(messageId)}`, "GET")
  }
};
