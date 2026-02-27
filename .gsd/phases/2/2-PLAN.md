---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: Implement Scheduler Job

## Objective
Create the background worker that constantly scans for overdue invoices and executes the escalation checks.

## Context
- server/src/utils/escalationEngine.ts 
- server/src/jobs/reminderScheduler.ts (to be created)
- server/src/index.ts

## Tasks

<task type="auto">
  <name>Create Scheduler Job</name>
  <files>d:\Vivitsu\kiranaLink\server\src\jobs\reminderScheduler.ts</files>
  <action>
    Create the chron job logic:
    - Import `node-cron`, the `Invoice` model, and `evaluateEscalation`.
    - Create a function `startInvoiceScheduler()` which schedules a job running periodically (e.g., `* * * * *` for every minute during hackathon).
    - Inside the job: Query all `Invoice.find({ status: { $in: ['unpaid', 'overdue'] } })`.
    - Iterate over invoices, pass to `evaluateEscalation`.
    - If escalation is required, eventually we will call the communication layer. For now, simulate sending merely via a robust `console.log(Triggering ${tone} to ${client_name})` and mock-update the invoice's `reminder_level` and `last_contacted_at` in the DB.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>reminderScheduler exports an initializable function and compiles successfully.</done>
</task>

<task type="auto">
  <name>Bootstrap Scheduler in Express</name>
  <files>d:\Vivitsu\kiranaLink\server\src\index.ts</files>
  <action>
    Import `startInvoiceScheduler` from `src/jobs/reminderScheduler.ts` inside `index.ts`.
    Invoke the loader right before `httpServer.listen(...)` to begin the background worker loop immediately on server boot.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>The Express server initiates the background scheduler explicitly.</done>
</task>

## Success Criteria
- [ ] A chron job exists that independently queries the DB at a set interval.
- [ ] `index.ts` integrates the background service neatly into the startup sequence.
