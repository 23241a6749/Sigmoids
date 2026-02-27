# 🎯 QUICK START: Make Your First Real Call

## ⚡ **5-MINUTE SETUP**

### **Step 1: Add a Test Customer (2 min)**
```
1. Open http://localhost:5173
2. Click "Khata / Udhaar" in navigation
3. Click "+ Add Customer"
4. Enter:
   - Name: Your Name
   - Phone: +91[Your 10-digit number]
5. Click "Save Customer"
```

### **Step 2: Create Outstanding Balance (1 min)**
**Option A - Manual (Quick)**:
1. Open browser DevTools (F12)
2. Go to Application → IndexedDB → GraminDB → customers
3. Find your customer
4. Edit `khataBalance` to `500`
5. Save

**Option B - Through Billing (Realistic)**:
1. Go to Billing page
2. Add items to cart
3. Select your customer
4. Choose "Khata" payment method
5. Complete sale

### **Step 3: Make the Call! (2 min)**
```
1. Click "AI Agent 🤖" in navigation
2. You should see yourself in the list
3. Click "Recover" button
4. Wait 5-10 seconds for connection
5. ANSWER YOUR PHONE!
6. Talk to the AI
7. Watch transcript appear in real-time
```

---

## 📱 **WHAT TO SAY DURING THE CALL**

### **Test Positive Response**:
```
AI: "Namaste [Name] ji! Main GraminLink se bol raha hoon..."
YOU: "Ha bhai, kal pay kar dunga" (Yes, I'll pay tomorrow)
AI: "Dhanyavaad ji!"
→ Sentiment should turn GREEN
```

### **Test Negative Response**:
```
AI: "Aapka ₹500 ka payment pending hai..."
YOU: "Abhi busy hoon, baad mein call karo" (I'm busy, call later)
AI: "Sorry ji, shop owner aapko call karenge"
→ Sentiment should turn RED
```

---

## 🎥 **WHAT YOU'LL SEE**

### **On Screen**:
- ✅ Modal opens with sci-fi design
- ✅ Status: "CONNECTING" → "ACTIVE"
- ✅ Sound waves animate
- ✅ Transcript scrolls in real-time
- ✅ Sentiment changes based on conversation
- ✅ Call ends automatically

### **On Your Phone**:
- ✅ Incoming call from Vapi number
- ✅ AI voice speaking Hinglish
- ✅ Natural conversation flow
- ✅ Polite and respectful tone

---

## ⚠️ **TROUBLESHOOTING**

### **"No customers showing up"**
→ Check khataBalance > 0 in database

### **"Call not connecting"**
→ Verify phone number has +91 prefix
→ Check Vapi dashboard for errors
→ Ensure Vapi credits available

### **"Can't hear AI"**
→ Check phone volume
→ Verify Vapi phone number configured

### **"Still not working?"**
→ Set `useSimulation = true` in LiveCallModal.tsx (line 15)
→ This gives you a perfect demo without real calls

---

## 🎬 **DEMO MODE (FALLBACK)**

If real calls aren't working for the demo:

1. Open `src/components/recovery/LiveCallModal.tsx`
2. Change line 15:
   ```typescript
   const useSimulation = true; // Change false to true
   ```
3. Save file
4. Now clicks will show perfect simulated conversation
5. Looks identical to real calls
6. 100% reliable for presentations

---

## 🚀 **YOU'RE READY!**

**Current Status**:
- ✅ Real customer data from Khata
- ✅ Vapi API key configured
- ✅ Real calls enabled
- ✅ Build successful

**Next**: Add yourself as a customer and make that first call!

**Time to test**: ~5 minutes
**Wow factor**: 🔥🔥🔥

---

## 📞 **SUPPORT**

If you need help:
1. Check `REAL_CALLS_GUIDE.md` for detailed troubleshooting
2. Check browser console for errors
3. Check Vapi dashboard logs
4. Use simulation mode as backup

**Good luck with your first AI call! 🎉**
