---
phase: 4
plan: 2
wave: 2
---

# Plan 4.2: Twilio Reply Webhook Controller

## Objective
Establish the inbound POST route that Twilio (or email equivalent) hits when a customer actually replies to the generated AI prompt.

## Context
- server/src/models/Invoice.ts
- server/src/services/intentClassifier.ts
- server/src/routes/invoiceWebhooks.ts (to be created)
- server/src/index.ts

## Tasks

<task type="auto">
  <name>Create Inbound Webhook Route</name>
  <files>d:\Vivitsu\kiranaLink\server\src\routes\invoiceWebhooks.ts</files>
  <action>
    Create a new Express router mapping `/api/invoices/webhook/reply`. 
    - Extract `From` (phone number) and `Body` (message) from the standard `x-www-form-urlencoded` Twilio webhook payload.
    - Clean the `From` string (Twilio prepends 'whatsapp:' for WA).
    - Find the actively unpaid `Invoice` matching `client_phone`.
    - Pass the `Body` to `classifyIntent(Body)`.
    - Apply Business Rules:
      - If `PAYMENT_PROMISED` -> Add 3 days to due_date or simply pause the `reminder_level` escalation temporarily by setting `status = 'promised'`. (Let's stick to updating status to 'paused'/'promised' or noting it in history).
    - **Note:** For simplicity, just append the customer's response into `reminder_history` with `channel: 'customer_reply'` and halt the specific invoice status if promising to pay or disputing.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Webhook route elegantly intercepts and classifies the Twilio POST request without crashing.</done>
</task>

<task type="auto">
  <name>Mount Webhook Route in Server</name>
  <files>d:\Vivitsu\kiranaLink\server\src\index.ts</files>
  <action>
    Import `invoiceWebhooksRouter` from `src/routes/invoiceWebhooks.ts` into `index.ts`.
    Mount it to `app.use('/api/invoices/webhook', invoiceWebhooksRouter)`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Express explicitly handles the new webhook space.</done>
</task>

## Success Criteria
- [ ] Twilio replies can be successfully routed, matched to a specific Invoice via their phone number, and recorded historically.
- [ ] AI categorization modifies the invoice state as designed.
