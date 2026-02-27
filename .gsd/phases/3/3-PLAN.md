---
phase: 3
plan: 3
wave: 2
---

# Plan 3.3: Integration with Scheduler

## Objective
Replace the 'simulated' logging from Phase 2 with actual text generation and delivery dispatching from `messageGenerator` and `communicationService` inside the daily cron task.

## Context
- server/src/jobs/reminderScheduler.ts
- server/src/services/messageGenerator.ts
- server/src/services/communicationService.ts

## Tasks

<task type="auto">
  <name>Bind Services to Cron Job</name>
  <files>d:\Vivitsu\kiranaLink\server\src\jobs\reminderScheduler.ts</files>
  <action>
    Import `generateMessage` and `sendNotification`.
    Inside the chron loop for an extracted `invoice` that `shouldRemind`:
    - Let `channel = 'whatsapp'` (as default for now).
    - Await `message = generateMessage(invoice, escalation.tone, channel)`.
    - Await `delivery_status = sendNotification(invoice, message, channel)`.
    - Push this actual `channel`, `message` and `delivery_status` into `invoice.reminder_history`.
    - Ensure `await invoice.save()` uses live data over simulated strings.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>The scheduler is successfully wired to orchestrate AI text and Twilio dispatch events properly!</done>
</task>

## Success Criteria
- [ ] Simulated placeholder code is removed from the cron script.
- [ ] Live LLM and communication services execute sequentially against the rules engine.
