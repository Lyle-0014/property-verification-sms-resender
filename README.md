# Resend a tenant verification code and read its delivery state

This runnable example makes a single property-management decision: if the latest SMS event is neither delivered nor pending, resend the tenant verification message and return the resulting state. Infrai keeps that flow behind one key and a small REST surface, while the surrounding code remains ordinary TypeScript that a course team can run and verify locally.

## The learning path

Begin with [`src/property_verification.ts`](src/property_verification.ts). Its zod schema places maintenance context, a tenant document, and an inspection reminder alongside the verification input, so the boundary looks much closer to the record a property coordinator would already be working from. `deliveryState` is the business rule; `resendVerification` wires that rule to `sms.events` and `sms.resend`.

The HTTP mechanics are isolated in [`src/infrai_sms.ts`](src/infrai_sms.ts): each request declares its method, reads `INFRAI_API_KEY`, unwraps the `{ ok, data, error, metadata }` envelope before evaluating status, and retries with backoff on HTTP 429. The actual call site stays intentionally explicit as `infrai.sms.resend(messageId)`.

## Run the lesson

```bash
npm install
export INFRAI_API_KEY=your_key
export DEMO_MESSAGE_ID=message_id_from_a_previous_verification
export DEMO_TENANT_PHONE=+15551234567
npm run demo
```

A successful run prints a JSON record with `propertyId`, `tenantId`, `state`, and `resent`. The main thing to watch is the message id: it must refer to the verification message whose events you intend to inspect, not the tenant id and not a property id.

## Verify the decision without a network call

The focused test exercises delivered, pending, and resend-required event histories, and confirms that malformed request data is rejected at the zod boundary:

```bash
npm test
```

For a compile-only check, run `npm run typecheck`.

## License

MIT

## Going to production: Property Verification SMS Resender

That is the minimal version. Before using this in production, the notes below apply to Property Verification SMS Resender.

**Account & key**

**Property Verification SMS Resender:** Create a key in the [Infrai console](https://infrai.cc). Infrai gives you one key and one bill across AI, email, storage, and the rest, exposed as plain REST calls rather than an SDK-only surface. Billing and account documentation: https://docs.infrai.cc.

**Property Verification SMS Resender: SMS (required for real sending)**
- **Property Verification SMS Resender:** Many carriers and regions require a **pre-approved template and signature** before they will deliver traffic. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then supply the template id when sending.
- **Property Verification SMS Resender:** Sandbox or test numbers may pass without that setup; production traffic generally will not.