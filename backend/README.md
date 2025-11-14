# 🏫 SIMS - Student Information Management System

A Node.js API server for managing student, teacher, and admin data.

---

## 📁 Project Structure
```
SIMS/
├── backend/           # Node.js API server
│   ├── db/            # Database modules
│   ├── src/
│   │   ├── config/    # Configuration files
│   │   ├── controllers/ # Request/response logic
│   │   ├── middlewares/ # Custom middleware
│   │   ├── models/    # Database models (User.js)
│   │   ├── routes/    # API routes
│   │   ├── services/  # Business logic
│   │   ├── utils/     # Utility functions
│   │   └── app.js     # Main Express app setup
│   ├── test/          # Test files
│   ├── .env           # Environment variables
│   ├── package.json
└── README.md
```
---

## 🛠️ Installation & Running

### 1. Install dependencies
```bash
npm install
npm install cors helmet
npm install --save-dev nodemon
npm install joi
```

### 2. Run server
```bash
npm run dev
```

---
