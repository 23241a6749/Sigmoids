# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
An autonomous "Invoice Chaser" AI subsystem integrated into KiranaLink. It automatically follows up with customers who have unpaid invoices by utilizing escalating levels of urgency across multiple communication channels (SMS, WhatsApp, Email, Voice). It manages the entire debt-collection conversation intelligently without human intervention until the payment is confirmed.

## Goals
1. Automate the entire invoice collection process to save time for small business owners.
2. Reduce overdue payment timelines using smart, escalating communication logic.
3. Maintain professional client communication by dynamically generating contextual messages using LLMs.
4. Improve cash flow transparency with a dedicated collections analytics dashboard.

## Non-Goals (Out of Scope)
- Building a full proprietary payment gateway (we will utilize mock/detection links for the hackathon demo).
- Handling overly complex legal compliance for debt collection across diverse international regions (focused on hackathon scope).

## Users
- **Primary:** Small business owners (Kirana stores) who need an automated way to collect unpaid bills.
- **Secondary:** End consumers receiving personalized, responsive reminders about their pending payments.

## Constraints
- **Technical:** Must integrate smoothly into the existing Node.js, Express, and React stack. Python is mentioned in the prompt, but integrating into KiranaLink's Node.js backend using equivalent logic makes the most architectural sense for a unified platform.
- **Timeline:** Must be rapid and robust for hackathon presentation (demo flow is critical).

## Success Criteria
- [ ] Ability to create and track invoices with different statuses.
- [ ] A background scheduler correctly identifies overdue triggers and advances the invoice to the next escalation level.
- [ ] System automatically generates varying message tones (friendly, polite, urgent, final notice) via LLMs based on days overdue.
- [ ] AI conversation handler accurately classifies incoming customer replies (e.g., payment promised, dispute).
- [ ] A clear, convincing demo flow UI.
