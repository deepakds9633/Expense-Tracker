# Expense Tracker

A **mobile-first** full-stack expense tracker to manage your **cash (coins & notes)** and **bank accounts (SBI, Canara, etc.)** from one clean dashboard.

## Tech Stack
- **Frontend**: React + Vite → Firebase Hosting
- **Backend**: Node.js + Express → Render
- **Database**: MongoDB Atlas

---

## 🚀 Run Locally

### 1. Backend
```bash
cd server
npm install
# Edit .env → add your MONGO_URI
npm run dev
```

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
Open: http://localhost:5173

---

## 🌐 Deploy

### Frontend → Firebase Hosting
```bash
cd client
npm run build
npm install -g firebase-tools
firebase login
firebase init   # choose Hosting → dist folder
firebase deploy
```

### Backend → Render
- Push `server/` folder to GitHub
- Go to render.com → New Web Service
- Build command: `npm install`
- Start command: `npm start`
- Add environment variable: `MONGO_URI=your_mongodb_url`

### Database → MongoDB Atlas
- Create free cluster at cloud.mongodb.com
- Get connection string
- Add to `server/.env` as `MONGO_URI`

---

## Features
- 📊 Dashboard — Total balance, cash split, all bank accounts
- 💸 Add Expense / Income — Auto-updates balance  
- 📋 History — All transactions with filter
- 🏦 Accounts — Manage cash & bank accounts
