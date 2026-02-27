---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Conversation Intent Classifier

## Objective
Implement an LLM-based utility that interprets incoming customer messages (SMS/WhatsApp replies) and categorizes their intent (e.g., promised payment, dispute, request extension) to intelligently halt or alter future reminders. Satisfies REQ-07.

## Context
- .gsd/SPEC.md
- server/src/routes/whatsapp.ts (Reference existing Twilio webhook structures)
- server/src/services/intentClassifier.ts (to be created)

## Tasks

<task type="auto">
  <name>Build AI Intent Classifier</name>
  <files>d:\Vivitsu\kiranaLink\server\src\services\intentClassifier.ts</files>
  <action>
    Create a new service exporting `classifyIntent(messageBody: string)`.
    - Setup the OpenAI client (with similar `DEMO_MODE` fallback mechanics as messageGenerator.ts).
    - Provide a system prompt requiring the LLM to output ONLY a strictly typed JSON or raw string classification from this exact list: `['PAYMENT_PROMISED', 'EXTENSION_REQUESTED', 'DISPUTE', 'UNKNOWN']`.
    - Provide strong fallback mock logic (e.g. if message contains "pay tomorrow" return 'PAYMENT_PROMISED') if the API key isn't present during hackathon execution to guarantee it still functions locally.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>intentClassifier.ts exports the classification function perfectly typed.</done>
</task>

## Success Criteria
- [ ] Classification logic correctly binds a free-text human prompt into one of 4 strict enum strings.
- [ ] Safe fallback logic for demo modes without API keys.
