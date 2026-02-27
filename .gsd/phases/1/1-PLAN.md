---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Data Models for Invoices

## Objective
Establish the foundational data structure for the Invoice Chaser Agent by creating a scalable Mongoose schema for Invoices. This satisfies REQ-01.

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- server/src/models/Invoice.ts (to be created)

## Tasks

<task type="auto">
  <name>Create Invoice Schema</name>
  <files>d:\Vivitsu\kiranaLink\server\src\models\Invoice.ts</files>
  <action>
    Create a new Mongoose model for Invoices with the following strictly typed fields:
    - invoice_id: String (unique)
    - client_name: String
    - client_email: String
    - client_phone: String
    - amount: Number
    - due_date: Date
    - status: String (enum: ['paid', 'unpaid', 'overdue'])
    - reminder_level: Number (default: 0)
    - last_contacted_at: Date
    - payment_link: String
    - reminder_history: Array of Objects ({ timestamp, channel, message_content, delivery_status })
    Add a pre-save hook to ensure the last_contacted_at updates appropriately when history is pushed.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Invoice.ts exports a valid Mongoose model with all specified fields.</done>
</task>

## Success Criteria
- [ ] The Invoice model compiles cleanly with TypeScript.
- [ ] All required fields from the problem statement are represented in the Mongoose Schema.
