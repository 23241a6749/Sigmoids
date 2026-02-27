# Kirana MVP - MongoDB Migration Guide

This project has been migrated from browser local storage (Dexie.js) to **MongoDB Atlas**.

## Prerequisites
- Node.js installed
- A MongoDB Atlas account and connection string (URI)

## Backend Setup (Server)
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   PORT=5000
   ```
4. Seed the database with initial products:
   ```bash
   npm run seed
   ```
5. Start the server (Development mode):
   ```bash
   npm run dev
   ```

## Frontend Setup
1. In the root directory, ensure the `API_BASE_URL` in `src/services/api.ts` matches your server (default is `http://localhost:5000/api`).
2. Run the frontend:
   ```bash
   npm run dev
   ```

## Key Migration Changes
- **Single Source of Truth**: All data (Products, Customers, Bills, Ledger) is now stored centrally in MongoDB.
- **Transactional Integrity**: Billing operations use MongoDB sessions to ensure stock consistency.
- **Phone-based Identification**: Customers are globally unique by phone number.
- **Zero Local Storage**: No data is persisted in the browser, enabling multi-device sync.
- **API Architecture**: Frontend communicates via a RESTful Express API.

## APIs Available
- `GET /api/products`: Fetch all products
- `POST /api/bills`: Create a bill (atomic stock + ledger update)
- `GET /api/customers`: Manage cloud khata accounts
- `GET /api/ledger`: Business transaction history
- `POST /api/group-buy`: Create/Join neighborhood deals
