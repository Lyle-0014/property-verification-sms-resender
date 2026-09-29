import { z } from "zod";
import { infrai } from "./infrai_sms.js";

export const verificationRequest = z.object({
  propertyId: z.string().min(1),
  tenantId: z.string().min(1),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/),
  messageId: z.string().min(1),
  maintenanceRequest: z.object({ id: z.string(), summary: z.string() }),
  tenantDocument: z.object({ name: z.string(), verified: z.boolean() }),
  inspectionReminder: z.object({ dueOn: z.string(), sent: z.boolean() })
});

export type VerificationRequest = z.infer<typeof verificationRequest>;
export type DeliveryState = "delivered" | "pending" | "needs_resend";

export function deliveryState(events: Array<{ type?: string; status?: string }>): DeliveryState {
  const latest = events.at(-1)?.status ?? events.at(-1)?.type;
  if (latest === "delivered") return "delivered";
  if (latest === "queued" || latest === "sent" || latest === "pending") return "pending";
  return "needs_resend";
}

export async function resendVerification(input: unknown) {
  const request = verificationRequest.parse(input);
  const events = await infrai.sms.events(request.messageId);
  const before = deliveryState(events);
  if (before === "needs_resend") await infrai.sms.resend(request.messageId);
  const afterEvents = before === "needs_resend" ? await infrai.sms.events(request.messageId) : events;
  return { propertyId: request.propertyId, tenantId: request.tenantId, state: deliveryState(afterEvents), resent: before === "needs_resend" };
}
