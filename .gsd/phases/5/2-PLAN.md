---
phase: 5
plan: 2
wave: 2
---

# Plan 5.2: Hackathon Demo Trigger

## Objective
Implement specialized Hackathon-specific components establishing a streamlined presentation flow where an invoice gets generated, deliberately aged out synthetically, and triggers the AI chaser instantaneously. Satisfies REQ-09.

## Context
- .gsd/SPEC.md
- src/features/chaser/InvoiceDashboard.tsx
- server/src/routes/invoices.ts (verify mock bypasses if needed)

## Tasks

<task type="auto">
  <name>Build "Run Magic Demo" Component</name>
  <files>d:\Vivitsu\kiranaLink\src\features\chaser\InvoiceDashboard.tsx</files>
  <action>
    Update the `InvoiceDashboard.tsx` with a distinct, flashy "Start Auto-Pilot Demo" button.
    When clicked:
    - Fire a POST request to create an invoice (`createDemoInvoice` api function) with a dummy `invoice_id`, `client_name = "Hackathon Judge"`, `client_phone` set to a hardcoded Twilio valid test number (or the user's cell), and critically, forcefully set the `due_date` to be 20 days **in the past** (e.g. `const pastDate = new Date(); pastDate.setDate(pastDate.getDate() - 20)`).
    - This artificially creates an immediately overdue state. The backend chron-job established in Phase 2 should naturally pick it up on the next 60-second loop tick causing the escalation to fire instantly for the judges.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Hook fires successfully placing an artificially aged invoice into MongoDB.</done>
</task>

## Success Criteria
- [ ] Users do not have to wait 24 hours to watch the escalations trigger.
- [ ] AI runs end-to-end natively during a ~10-minute tech presentation.
