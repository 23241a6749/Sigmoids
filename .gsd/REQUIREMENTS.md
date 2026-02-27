# REQUIREMENTS.md

## Format
| ID | Requirement | Source | Status |
|----|-------------|--------|--------|
| REQ-01 | **Invoice Management**: Data models and APIs (create, list, update). | User/PS | Pending |
| REQ-02 | **Reminder Scheduler**: Background chron job checking overdue invoices and triggering rules (Day 1, 3, 7, 14 delays). | User | Pending |
| REQ-03 | **Escalation Engine**: Tracker of past reminders, channel used, and escalation progression. | User | Pending |
| REQ-04 | **Communication Layer**: Abstraction supporting pluggable adapters (Email (SMTP), SMS/WA (Twilio), Voice (VAPI)). | User/PS | Pending |
| REQ-05 | **AI Message Generator**: LLM implementation to draft context-aware messages with tone shifting (Friendly -> Firm). | User/PS | Pending |
| REQ-06 | **Payment Detection**: Mechanism to mark invoices paid and halt reminder workflows immediately. | User | Pending |
| REQ-07 | **Conversation Handling**: Intent classification on customer replies (e.g., promised, delay request) using LLMs. | User | Pending |
| REQ-08 | **Analytics Dashboard**: React UI showing metrics (total, overdue, success rate) and a detailed table view. | User | Pending |
| REQ-09 | **Hackathon Demo Flow**: A distinct sandbox/presentation flow demonstrating an invoice moving through all phases. | User | Pending |
