---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Front-end Integrations & React Analytics

## Objective
Build out the React interface to securely display the automated Invoice Chaser pipeline statuses to the small business owner. This satisfies REQ-08.

## Context
- .gsd/SPEC.md
- src/services/api.ts (add paths for `/api/invoices`)
- src/features/chaser/InvoiceDashboard.tsx (to be created)
- src/App.tsx (route integration)

## Tasks

<task type="auto">
  <name>Extend Frontend API Service</name>
  <files>d:\Vivitsu\kiranaLink\src\services\api.ts</files>
  <action>
    Export helper functions inside `src/services/api.ts` utilizing `api.get` or `api.post`:
    - `getInvoices()`
    - `createDemoInvoice(payload)`
    - `markInvoicePaid(id)`
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Frontend API services can call the backend safely.</done>
</task>

<task type="auto">
  <name>Create Analytics Dashboard UI</name>
  <files>d:\Vivitsu\kiranaLink\src\features\chaser\InvoiceDashboard.tsx</files>
  <action>
    Create a robust UI (`InvoiceDashboard.tsx`) utilizing Tailwind classes:
    - Display four statistics cards at the top: Total Autopilot Invoices, Active Recoveries, Payment Promised (Paused), and Total Successfully Recovered.
    - Implement a `<table>` mapping over invoices fetched from `getInvoices()`. Show `client_name`, `amount`, `status`, and currently applied `reminder_level`.
    - Provide an interactable "Mark Paid" button on the table for business owners who received cash directly and need to halt the robot.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>InvoiceDashboard structurally defines an analytics page capable of reading the state.</done>
</task>

<task type="auto">
  <name>Mount Dashboard Route</name>
  <files>d:\Vivitsu\kiranaLink\src\App.tsx</files>
  <action>
    Import `InvoiceDashboard` and mount it to `<Route path="/chaser" element={<InvoiceDashboard />} />` inside the KiranaLink router tree.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Route mounts successfully alongside analytics and bills.</done>
</task>

## Success Criteria
- [ ] Business owner can view live AI escalations effectively via Table UI mapping over JSON array.
- [ ] Frontend successfully hits `/api/invoices` without CORS or routing issues.
