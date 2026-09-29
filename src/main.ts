import { resendVerification } from "./property_verification.js";

const messageId = process.env.DEMO_MESSAGE_ID;
const phone = process.env.DEMO_TENANT_PHONE;
if (!messageId || !phone) throw new Error("DEMO_MESSAGE_ID and DEMO_TENANT_PHONE are required");

const result = await resendVerification({
  propertyId: "building-17", tenantId: "tenant-204", phone, messageId,
  maintenanceRequest: { id: "maint-81", summary: "Leaking kitchen tap" },
  tenantDocument: { name: "lease.pdf", verified: true },
  inspectionReminder: { dueOn: "2026-10-04", sent: false }
});
console.log(JSON.stringify(result, null, 2));
