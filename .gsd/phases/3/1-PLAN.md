---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: AI Message Generator

## Objective
Implement a service to generate context-aware, personalized collection messages applying varying tones using an LLM (OpenAI/Ollama). Satisfies REQ-05.

## Context
- .gsd/SPEC.md
- server/src/utils/ai.ts (existing AI utility logic if applicable, I see OpenAI and Ollama in dependencies)
- server/src/services/messageGenerator.ts (to be created)

## Tasks

<task type="auto">
  <name>Build AI Generator Service</name>
  <files>d:\Vivitsu\kiranaLink\server\src\services\messageGenerator.ts</files>
  <action>
    Create a new module `messageGenerator.ts` exporting an async function `generateMessage(invoice, tone, channel)`.
    - Setup OpenAI configuration using `process.env.OPENAI_API_KEY`. (A placeholder or Ollama fallback may be good, but standard `openai` package is preferred for the hackathon).
    - Write a prompt template that takes: `client_name`, `amount`, `due_date`, and the prescribed `tone` (from the EscalationEngine).
    - Also specify constraints based on the `channel` (e.g., if channel = 'SMS', keep it strictly under 160 characters. If channel = 'WhatsApp', keep it brief but use slightly richer formatting).
    - Instruct the LLM to provide a highly convincing, culturally appropriate but strictly professional message.
    - Important: Output MUST include the `payment_link` if available, or just a generic placeholder for the hackathon.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>messageGenerator.ts successfully compiles and exports the function.</done>
</task>

## Success Criteria
- [ ] LLM integration abstracts API calls successfully.
- [ ] Returns a dynamic string appropriately formatted for the requested communication channel.
