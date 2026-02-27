---
phase: 3
plan: 2
wave: 1
---

# Plan 3.2: Communication Dispatcher

## Objective
Establish the communication abstraction layer integrating Twilio (WhatsApp/SMS) and SMTP (Email) so that dynamic AI messages can actually be sent. Satisfies REQ-04.

## Context
- .gsd/SPEC.md
- server/src/services/communicationService.ts (to be created)
- server/src/models/Invoice.ts

## Tasks

<task type="auto">
  <name>Create Twilio and SMTP Interfaces</name>
  <files>d:\Vivitsu\kiranaLink\server\src\services\communicationService.ts</files>
  <action>
    Create an abstract dispatcher `sendNotification(invoice, message, channel)`.
    - Install `nodemailer` and `@types/nodemailer` (via npm in server folder) to handle the 'email' requirement.
    - For `channel === 'whatsapp'`: Use Twilio's client (`process.env.TWILIO_ACCOUNT_SID`, etc). Send to `whatsapp:${invoice.client_phone}`.
    - For `channel === 'sms'`: Use Twilio's client to send standard SMS.
    - For `channel === 'email'`: Handle via `nodemailer` using dummy ENV vars (or ethereal email for hackathon demo).
    - Return a boolean or distinct status indicating 'delivered' or 'failed'.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>The dispatcher elegantly routes messages to the correct API provider based on the channel input.</done>
</task>

## Success Criteria
- [ ] `nodemailer` is installed.
- [ ] Twilio WhatsApp/SMS implementation is functional inside the monolithic dispatcher.
