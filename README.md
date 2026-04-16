# 💸 Spendly — MERN Expense Tracker

A full-stack expense tracker built with **MongoDB, Express, React, Node.js**.

## Features
- 🔐 JWT Auth — register, login, protected routes
- 📊 Dashboard — monthly summary, budget progress, recent transactions
- 💳 Transactions — add/edit/delete with category, type, date, notes
- 📈 Analytics — bar charts, pie charts (Recharts), 6-month trend
- ⚙️ Settings — update name, currency, monthly budget, password
- 🎨 Dark UI — custom design with CSS variables

## Tech Stack
| Layer    | Tech                        |
|----------|-----------------------------|
| Frontend | React 18, React Router 6    |
| Charts   | Recharts                    |
| Backend  | Node.js, Express            |
| Database | MongoDB + Mongoose          |
| Auth     | JWT + bcryptjs              |
| Styling  | Plain CSS with variables    |

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 2. Clone & Install
```bash
git clone <repo-url>
cd expense-tracker
npm install          # root concurrently
cd server && npm install
cd ../client && npm install
```

### 3. Configure Environment
```bash
cp server/.env.example server/.env
# Edit server/.env with your MONGO_URI and JWT_SECRET
```

### 4. Run
```bash
# From root — runs both server + client
npm run dev

# Or separately:
npm run start:server   # API on :5000
npm run start:client   # React on :3000
```

## API Endpoints

### Auth
| Method | Endpoint          | Description     |
|--------|-------------------|-----------------|
| POST   | /api/auth/register| Register        |
| POST   | /api/auth/login   | Login           |
| GET    | /api/auth/me      | Get profile     |
| PUT    | /api/auth/profile | Update profile  |

### Expenses (requires Bearer token)
| Method | Endpoint                | Description         |
|--------|-------------------------|---------------------|
| GET    | /api/expenses           | List (with filters) |
| GET    | /api/expenses/summary   | Monthly summary     |
| POST   | /api/expenses           | Create              |
| PUT    | /api/expenses/:id       | Update              |
| DELETE | /api/expenses/:id       | Delete              |

## Project Structure
```
expense-tracker/
├── server/
│   ├── index.js
│   ├── models/
│   │   ├── User.js
│   │   └── Expense.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── expenses.js
│   └── middleware/
│       └── auth.js
└── client/
    └── src/
        ├── App.js
        ├── context/AuthContext.js
        ├── utils/api.js
        ├── components/
        │   ├── Layout.js
        │   └── AddExpenseModal.js
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── Dashboard.js
            ├── Transactions.js
            ├── Analytics.js
            └── Settings.js
```
