# Feature Deep Dive: AI Agents (Recovery & WhatsApp)
## Overcoming Low-Tech Barriers & Solving the Credit Crisis

---

## 1. The Core Problem: The Twin Barriers

### Pain Point A: The "Khata" (Credit) Recovery Nightmare
*   **The Problem:** In India's informal economy, credit is king. 60-70% of transactions are on credit ("Udhaar"). However, **recovering this debt is a social nightmare.**
*   **The friction:** A shopkeeper cannot be rude to a neighbor. Calling them to ask for money feels like harassment and damages relationships. This leads to:
    1.  Endless delays ("Kal duga" - I'll pay tomorrow).
    2.  Bad debt (15-20% revenue loss).
    3.  Cash flow crunch for the shop.

### Pain Point B: The Digital Literacy Gap
*   **The Problem:** Most rural users know how to use WhatsApp (mostly for voice notes and video calls), but they **cannot navigate complex e-commerce apps** like Amazon or Flipkart.
*   **The Friction:** Type-based searching, filters, and checkout flows are intimidating and foreign to them. They prefer saying: *"Bhaiya, send me 1kg rice."*

---

## 2. Our Solution: Voice-First AI Agents
We deployed two specialized AI Agents to act as the "Digital Staff" for the shopkeeper. These agents bridge the gap between high-tech capability and low-tech user behavior.

### A. The "Vapi" Recovery Agent (The Debt Collector)
This is an autonomous AI bot that calls customers who have overdue payments.

*   **How it Works:**
    1.  **Trigger:** The system detects a customer is 30 days overdue.
    2.  **The Call:** The AI uses **Vapi.ai** to dial the customer's phone.
    3.  **The Negotiation:** It speaks in a polite, professional, yet firm tone (available in Hindi/English).
        *   *AI:* "Namaste, this is an automated call from Raju Kirana Store. Your balance of ₹1,500 is pending."
        *   *Customer:* "I am out of station, I will pay next week."
        *   *AI:* "Noted. I will mark your status as 'Promised' for next Tuesday. Thank you!"
    4.  **The Update:** The AI analyzes the conversation sentiment and updates the database automatically (Status: `PROMISED` or `FAILED`).

*   **Why Limit Breaking?** It removes the **social awkwardness** from debt collection. The shopkeeper preserves their relationship ("It was the computer calling, not me!"), while the machine ensures disciplined follow-up.

### B. The WhatsApp Ordering Agent (The Digital Order Taker)
This agent turns WhatsApp into a full-fledged e-commerce app without the UI complexity.

*   **How it Works:**
    1.  **Input:** User sends a **Voice Note** on WhatsApp: *"Ek kilo taaza tamatar aur 5 packet Maggi bhejo."*
    2.  **Transcription:** The system uses **Google Gemini** (Multimodal LLM) to transcribe the audio.
    3.  **Parsing:** The LLM extracts structured data:
        *   Item: Tomato, Qty: 1kg
        *   Item: Maggi, Qty: 5 units
    4.  **Inventory Check:** It queries the MongoDB database to check stock.
    5.  **Confirmation:** It replies on WhatsApp: *"Order Placed! Total ₹145. Delivery by 5 PM."*

### C. The WhatsApp Reminder Bot (Gentle Nudges)
While the Voice Agent handles critical debt recovery, the WhatsApp Bot handles "Soft Reminders" to prevent debt from aging.

*   **How it Works:**
    1.  **Scheduled Nudge:** 3 days before a payment is due, the bot sends a polite automated message: *"Namaste Rajesh, your bill of ₹500 is due on Tuesday."*
    2.  **Payment Link:** It includes a direct UPI link for instant 1-click payment using GooglePay/PhonePe.
    3.  **Two-Pronged Strategy:** We use a "Good Cop, Bad Cop" approach:
        *   **WhatsApp Bot:** Friendly reminders (Good Cop).
        *   **Voice AI Agent:** Firm calls for overdue payments (Bad Cop).

---

## 3. Beneficiaries & Impact

### 🏪 For the Shopkeeper
*   **Cash Flow:** Drastic reduction in bad debt due to timely, automated follow-ups.
*   **Time Saving:** No need to manually type out orders from phone calls. The AI enters it directly into the billing system.
*   **Professionalism:** The shop appears modern and organized to customers.

### 🏠 For the Customer
*   **Accessibility:** Zero learning curve. If they can speak, they can order.
*   **No Shame:** Being reminded by a bot is less humiliating than being shouted at by a shopkeeper in public.

---

## 4. Technical Implementation & Open Source Power

### Open Source & Tech Stack
1.  **Voice AI Engine:** **Vapi.ai** (Integrated via API). This handles the low-latency streaming of audio to make the conversation feel natural.
2.  **Intelligence Model:** **Google Gemini** (via Open Source SDK). We chose Gemini for its superior performance in understanding Indian contexts and languages compared to generic models.
3.  **Messaging Layer:** **Twilio** (Standard API) connected to the WhatsApp Business API.
4.  **Database:** **MongoDB** (Open Source). Its flexible schema allows us to store unstructured conversation logs alongside structured transaction data easily.

### The Innovation: Sentiment Analysis
We don't just record the call; we analyze it.
*   If a customer shouts -> The AI detects `Anger` -> Tags customer as `High Risk`.
*   If a customer creates a date -> The AI detects `Commitment` -> Sets a reminder.

---

## 5. Summary
We are not trying to "teach" villagers how to use apps. We are **teaching apps how to understand villagers.**
By using Voice AI as the primary interface, GraminLink makes sophisticated commerce features accessible to the illiterate and the elderly, effectively unlocking the "Next Billion Users."
