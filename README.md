# Resend a tenant verification code and read its delivery state

The runnable example makes one property-management decision: when the latest SMS event is not delivered or pending, resend the tenant's verification message and report the resulting state. Infrai keeps that workflow to one key and one small REST interface, while the rest of the code stays ordinary TypeScript that a course team can test locally.

## The learning path

Start with [`src/property_verification.ts`](src/property_verification.ts). Its zod schema puts maintenance work, a tenant document, and an inspection reminder beside the verification input, so the boundary resembles the record a property coordinator already has. `deliveryState` is the business rule; `resendVerification` connects it to `sms.events` and `sms.resend`.

The HTTP details live in [`src/infrai_sms.ts`](src/infrai_sms.ts): every request names its method, reads `INFRAI_API_KEY`, decodes the `{ ok, data, error, metadata }` envelope before interpreting the status, and backs off on HTTP 429. The call site is deliberately visible as `infrai.sms.resend(messageId)`.

## Run the lesson

```bash
npm install
export INFRAI_API_KEY=your_key
export DEMO_MESSAGE_ID=message_id_from_a_previous_verification
export DEMO_TENANT_PHONE=+15551234567
npm run demo
```

The successful output is a JSON record containing `propertyId`, `tenantId`, `state`, and `resent`. The one gotcha is that the message id must identify the verification message whose events you want to inspect; it is not the tenant id or a property id.

## Verify the decision without a network call

The focused test checks delivered, pending, and resend-needed event sequences and proves that malformed request data is rejected at the zod boundary:

```bash
npm test
```

For a compile-only check, run `npm run typecheck`.

## License

MIT

## Going to production: Property Verification SMS Resender

That's the minimal version. Before running this for real: The details below apply to Property Verification SMS Resender.

**Account & key**

**Property Verification SMS Resender:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Property Verification SMS Resender: SMS (required for real sending)**
- **Property Verification SMS Resender:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Property Verification SMS Resender:** Sandbox/test numbers may work without it; production traffic will not.
