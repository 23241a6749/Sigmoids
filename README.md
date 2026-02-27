# KiranaLink MVP 🚀

A modern Billing and Management system for Kirana/MSME shops. Features include high-speed billing, digital khata, product management, and Google Authentication.

## 🛠️ Features
- **Dynamic Billing**: Quick search and add products to cart.
- **Authentication**: Manual and Google OAuth 2.0 (Strict selection).
- **Inventory Management**: Track and update stock levels.
- **Digital Khata**: Manage customer credits and payments.
- **Ledger**: Holistic view of shop transactions.
- **Analytics**: Visualize sales performance.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Google Cloud Console project (for OAuth)

### 2. Installation
Clone the repository and install dependencies for both frontend and backend:

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 3. Environment Setup
Create a `.env` file in the `server` directory and add the following (see `.env.example`):

```bash
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5174
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

### 4. Running the App
Start the backend first, then the frontend.

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
# In the root directory
npm run dev
```

The app will be available at `http://localhost:5174`.

## 🛡️ Authentication Note
For Google OAuth to work locally, ensure your Google Cloud Console has the following:
- **Authorized Javascript Origins**: `http://localhost:5174`
- **Authorized Redirect URIs**: `http://localhost:5000/api/auth/google/callback`

## 🤝 Contribution
When pushing changes, please ensure you do not push your `.env` file. A `.gitignore` has been pre-configured to avoid this.
