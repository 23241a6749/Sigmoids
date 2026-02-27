# 🔑 HOW TO GET YOUR VAPI PRIVATE KEY

## 📋 **STEP-BY-STEP GUIDE**

### **Step 1: Go to Vapi Dashboard**
1. Open: https://dashboard.vapi.ai
2. Log in with your account

### **Step 2: Find API Keys**
Look for one of these in the sidebar:
- **"API Keys"**
- **"Settings"** → **"API Keys"**
- **"Developer"** → **"API Keys"**

### **Step 3: Identify the Right Key**

You'll see two types of keys:

#### **Public Key** (What you gave me)
```
e1033186-4684-4cad-a33b-12dfabffbeaf
```
- ✅ Used for: Web SDK (browser-based calls)
- ❌ NOT for: Phone Call API

#### **Private/Server Key** (What we need)
```
Starts with: sk_live_... or similar
```
- ✅ Used for: API calls (outbound phone calls)
- ⚠️ Keep secret! Don't share publicly

### **Step 4: Copy the Private Key**
1. Click "Show" or "Reveal" next to the private key
2. Copy the entire key
3. Send it to me OR update the code yourself

---

## 🔧 **OPTION 1: Tell Me the Key**

Just paste it here and I'll update the code for you!

---

## 🔧 **OPTION 2: Update It Yourself**

**File**: `src/components/recovery/LiveCallModal.tsx`
**Line**: 74

**Change this:**
```typescript
'Authorization': 'Bearer e1033186-4684-4cad-a33b-12dfabffbeaf',
```

**To this:**
```typescript
'Authorization': 'Bearer YOUR_PRIVATE_KEY_HERE',
```

**Save the file** and the dev server will auto-reload!

---

## ✅ **WHAT I'VE ALREADY DONE**

- ✅ Added your phone number ID: `b1e1b956-6134-41a6-b513-75216615cdf7`
- ✅ Configured Phone Call API
- ✅ Set up proper request format
- ✅ Build successful

**Only missing**: The correct private API key!

---

## 🎯 **AFTER YOU UPDATE THE KEY**

1. **Refresh browser** (Ctrl + F5)
2. **Go to AI Agent** page
3. **Click "Recover"** on a customer
4. **Open console** (F12)
5. **Watch for**:
   - ✅ "Call initiated successfully" → Your phone will ring!
   - ❌ Error message → We'll debug further

---

## 📱 **REMINDER: PHONE NUMBER FORMAT**

Make sure customer phone number is:
```
✅ CORRECT: +919876543210
❌ WRONG: 9876543210
```

---

## 🚀 **YOU'RE ALMOST THERE!**

Just need the private key and you'll be making real AI calls! 📞

**Get the key from Vapi dashboard and let me know!**
