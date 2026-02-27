# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0 (Hackathon Ready)

## Must-Haves (from SPEC)
- [ ] Invoice Management core.
- [ ] Scheduling and Escalation workflows.
- [ ] AI-driven Multi-channel Communications.
- [ ] Intent Classification for replies.
- [ ] Analytics and Demo Dashboard.

## Phases

### Phase 1: Data Model & Invoice APIs
**Status**: ✅ Complete
**Objective**: Build the `Invoice` schema (amount, status, due_date, reminder_level, history) and standard REST endpoints. Create the foundational structure.
**Requirements**: REQ-01, REQ-06

### Phase 2: Scheduler & Escalation Engine
**Status**: ✅ Complete
**Objective**: Implement a background cron job that evaluates the database of unpaid invoices daily (or minute-by-minute for demo mode) to apply business rules and escalate urgency.
**Requirements**: REQ-02, REQ-03

### Phase 3: AI Message Generator & Communication Adapters
**Status**: ✅ Complete
**Objective**: Create the core communication dispatcher with Twilio (SMS/WhatsApp) and SMTP adapters. Integrate LLMs to actively generate the message payloads reflecting the current urgency tone.
**Requirements**: REQ-04, REQ-05

### Phase 4: Conversation & Intent Handler
**Status**: ✅ Complete
**Objective**: Intercept webhook replies from customers. Use an LLM to evaluate if the customer is promising payment, disputing the amount, or asking for time, and update the invoice state accordingly.
**Requirements**: REQ-07

### Phase 5: Dashboard & Demo Implementation
**Status**: ✅ Complete
**Objective**: Build the React front-end. This involves a comprehensive analytics dashboard for the business owner, and a specialized "Demo Console" to force-trigger days and showcase the automation magic to judges.
**Requirements**: REQ-08, REQ-09
