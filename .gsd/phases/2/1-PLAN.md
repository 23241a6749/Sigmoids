---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Scheduler Engine and Escalation Rules

## Objective
Implement a background scheduler that evaluates the database of unpaid invoices based on the number of days overdue. It will dictate the escalation logic (friendly, polite, urgent, final notice) seamlessly. This satisfies REQ-02 and REQ-03.

## Context
- .gsd/SPEC.md
- server/src/models/Invoice.ts
- server/src/utils/escalationEngine.ts (to be created)
- server/src/jobs/reminderScheduler.ts (to be created)
- server/package.json (for npm packages)

## Tasks

<task type="auto">
  <name>Install node-cron</name>
  <files>server/package.json</files>
  <action>
    Run `npm install node-cron` and `npm install -D @types/node-cron` in the `server` directory to manage scheduled chron jobs efficiently.
  </action>
  <verify>npm list node-cron</verify>
  <done>node-cron is installed successfully and listed in package.json.</done>
</task>

<task type="auto">
  <name>Build Escalation Engine</name>
  <files>d:\Vivitsu\kiranaLink\server\src\utils\escalationEngine.ts</files>
  <action>
    Create the pure logic file `escalationEngine.ts` exporting a function `evaluateEscalation(invoice)`.
    Rules:
    - Calculates days overdue.
    - If daysOverdue >= 14 AND invoice.reminder_level < 4 -> return { shouldRemind: true, level: 4, tone: 'final notice' }
    - If daysOverdue >= 7 AND invoice.reminder_level < 3 -> return { shouldRemind: true, level: 3, tone: 'urgent reminder' }
    - If daysOverdue >= 3 AND invoice.reminder_level < 2 -> return { shouldRemind: true, level: 2, tone: 'polite follow-up' }
    - If daysOverdue >= 1 AND invoice.reminder_level < 1 -> return { shouldRemind: true, level: 1, tone: 'friendly reminder' }
    - Note that for the hackathon "demo mode", we might want a flag or override to test this in minutes rather than days. Add an environment variable logic fallback for `DEMO_MODE=true` that calculates minutes overdue instead of days.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>escalationEngine exports the required evaluation logic without errors.</done>
</task>

## Success Criteria
- [ ] node-cron dependency is present for scheduling.
- [ ] The logic correctly maps days/minutes to urgency tones (1: friendly, 2: polite, 3: urgent, 4: final).
