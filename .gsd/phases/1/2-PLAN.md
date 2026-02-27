---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Invoice Management APIs

## Objective
Create the REST controller routes necessary for managing invoices, allowing the system to create them, detect payments, and list overdue ones. This satisfies the API portion of REQ-01 and REQ-06.

## Context
- .gsd/SPEC.md
- server/src/models/Invoice.ts
- server/src/routes/invoices.ts (to be created)
- server/src/index.ts

## Tasks

<task type="auto">
  <name>Implement Invoice Router</name>
  <files>d:\Vivitsu\kiranaLink\server\src\routes\invoices.ts</files>
  <action>
    Create a new Express router with the following endpoints:
    - POST /api/invoices (Create new invoice)
    - GET /api/invoices/overdue (List overdue invoices for the scheduler)
    - GET /api/invoices (List all invoices for analytics dashboard)
    - PUT /api/invoices/:id/status (Update invoice status, primarily for manually marking paid or via detection)
    - PUT /api/invoices/:id/payment (Record payment confirmation explicitly, stopping reminders)
    Implement robust error handling and ensure the route is strongly typed if possible.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>invoices.ts router handles all 5 endpoints successfully.</done>
</task>

<task type="auto">
  <name>Integrate Invoice Router</name>
  <files>d:\Vivitsu\kiranaLink\server\src\index.ts</files>
  <action>
    Import the new invoices router and mount it onto the main Express application at the `/api/invoices` path. Ensure it works alongside the existing routes (auth, ledgers, whatsapp, etc.).
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Express app uses the invoice router without crashing.</done>
</task>

## Success Criteria
- [ ] Endpoints exist for creating, retrieving, and updating invoice statuses.
- [ ] The app router correctly binds the new endpoints.
