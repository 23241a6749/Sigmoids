# Kirana MVP - Hackathon Project

A billing and inventory management system for small kirana/MSME shopkeepers.

## ✨ Features Implemented

### 1. **Products Section** 
- ✅ Populated with **65+ realistic Indian grocery items**
- ✅ Categories include:
  - Rice & Grains (Basmati, Sona Masoori, Wheat Flour, etc.)
  - Dal & Pulses (Toor, Moong, Chana, Masoor, etc.)
  - Cooking Oil (Sunflower, Mustard, Groundnut, etc.)
  - Dairy (Amul Milk, Butter, Cheese, Paneer, etc.)
  - Biscuits & Snacks (Parle-G, Kurkure, Lays, Maggi, etc.)
  - Spices & Masala (Red Chilli, Turmeric, Garam Masala, etc.)
  - Personal Care (Lux, Lifebuoy, Colgate, etc.)
  - Household (Vim, Surf Excel, Harpic, etc.)
  - Beverages (Coca Cola, Pepsi, Frooti, Bisleri, etc.)
- ✅ Realistic Indian prices (₹10 - ₹500 range)
- ✅ Each product has:
  - Name
  - Price (INR)
  - Unit (kg/g/100g/litre/packet/piece)
  - Stock quantity
  - Category
  - Icon

### 2. **Billing System** (Blinkit/Zepto-style from shopkeeper's perspective)
- ✅ **Add items to bill** - Tap product cards to add
- ✅ **Quantity controls** - Increase/decrease quantity per item with +/- buttons
- ✅ **Live total update** - Cart total updates in real-time
- ✅ **Product search** - Search by name or category
- ✅ **Voice search** - Mic button for voice input (if supported)
- ✅ **Order summary** - View all items before checkout
- ✅ **Remove items** - Decrease to zero or use trash icon

### 3. **Payment Modes**

#### **Cash Payment**
- ✅ Instant payment collection
- ✅ No online verification needed
- ✅ "Mark as Collected" button
- ✅ Immediate stock update

#### **UPI Payment (Razorpay Test Mode)**
- ✅ Simulated UPI payment flow
- ✅ 2-second processing animation
- ✅ Success confirmation modal
- ✅ No real money involved
- ✅ Test mode indicator

### 4. **Ledger Feature** (Placeholder)
- ✅ Stores all billing transactions
- ✅ Tracks:
  - Bill total
  - Payment mode (Cash/UPI)
  - Timestamp
  - Items purchased
  - Customer info (if applicable)
- ✅ Filter by payment mode (All/Cash/UPI)
- ✅ Summary cards showing:
  - Total revenue
  - Cash payments total
  - UPI payments total
  - Transaction counts
- ✅ Detailed transaction history with item breakdown

## 🗂️ Database Schema

### Updated Tables:
1. **Products** - Added `unit` field
2. **Ledger** - New table for transaction tracking

## 📱 Navigation

Access features via:
- **Bottom Navigation** (Billing, Deals, Customers, Products)
- **Hamburger Menu** (All features including Ledger)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:5173
```

## 📊 Data Seeding

Products are automatically seeded on first load. The seed data includes 65+ realistic kirana items with appropriate pricing.

## 🎯 User Flow

1. **Browse Products** - Navigate to Products section to see all items
2. **Start Billing** - Go to Billing (home page)
3. **Add Items** - Tap product cards to add to cart
4. **Adjust Quantities** - Use +/- buttons in cart
5. **Checkout** - Tap "View Cart" button
6. **Review Order** - Check items and total
7. **Select Payment** - Choose Cash or UPI
8. **Complete Transaction** - Confirm payment
9. **View Ledger** - Check transaction history in Ledger page

## 🎨 UI/UX Features

- Clean, simple interface
- Realistic shop flow (shopkeeper perspective)
- Real-time cart updates
- Smooth animations
- Dark mode support
- Offline capability
- Mobile-first design

## 🔧 Technical Stack

- **Frontend**: React + TypeScript
- **Routing**: React Router
- **Database**: Dexie.js (IndexedDB)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📝 Notes

- This is a **demo/hackathon project**
- UPI payments are **simulated** (no real transactions)
- Ledger is a **placeholder** (basic structure implemented)
- Focus on **realistic shop flow**, not consumer app UX

## 🎯 Future Enhancements (Not Implemented)

- Full Razorpay integration
- Customer management in billing
- Receipt printing
- Advanced ledger analytics
- Multi-store support
- Cloud sync

---

**Built for Hackathon MVP** 🚀
