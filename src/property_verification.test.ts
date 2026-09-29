import assert from "node:assert/strict";
import { deliveryState, verificationRequest } from "./property_verification.js";

assert.equal(deliveryState([{ status: "delivered" }]), "delivered");
assert.equal(deliveryState([{ status: "failed" }]), "needs_resend");
assert.equal(deliveryState([{ status: "queued" }]), "pending");
assert.throws(() => verificationRequest.parse({ propertyId: "p", tenantId: "t", phone: "555", messageId: "m" }));
console.log("property verification decision passed");
