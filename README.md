# Budget Overflow

A full-stack budgeting application built with a modern tech stack — **React + Vite + Redux Toolkit (client)** and **Express + TypeScript + PostgreSQL (server)**. The app allows users to register, log in, manage transactions by category, view financial summaries, and export data.

---

## 🌐 Project Structure

```
BudgetOverflow/
├── client/       # Frontend (React + Vite + Tailwind + Redux)
├── server/       # Backend (Node + Express + PostgreSQL)
└── README.md     # Project root documentation (this file)
```

---

## 📦 Technologies Used

### Client
- **React 19** – UI library
- **Redux Toolkit** – Global state management
- **React Router v7** – Client-side routing
- **Tailwind CSS v4** – Utility-first styling
- **ApexCharts** – Interactive graphs
- **TypeScript** – Type-safe JavaScript
- **Vite** – Lightning-fast dev server and build tool

### Server
- **Node.js** – JavaScript runtime
- **Express** – Web framework for building APIs
- **PostgreSQL** – Relational database
- **Knex.js** – SQL query builder
- **JWT authentication** – Secure token-based auth
- **TypeScript** – Static typing for better dev experience
- **bcrypt** – Password hashing
- **cookie-parser** – Parses cookies for session/token management
- **cors** – Cross-origin resource sharing
- **dotenv** – Environment variable management
- **express-rate-limit** – Request throttling and abuse prevention
- **helmet** – Secures HTTP headers
- **tsx** – TypeScript node runner with ESM + watch mode

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL

---

## 🛠️ Backend Setup (Server)

```bash
cd server
npm install                # install server dependencies
cp .env.example .env       # add your DB credentials and JWT secrets
npm run migrate:latest     # create DB tables
npm run seed:run           # populate default categories
npm run dev                # start server on http://localhost:3000
```

---

## 💻 Frontend Setup (Client)

```bash
cd client
npm install                # install client dependencies
cp .env.example .env       # set VITE_API_URL=http://localhost:3000
npm run dev                # start dev server on http://localhost:5173
```

---

## 🧪 API Testing with Postman

Postman files are included for local testing.

### Files:
- `BudgetOverflow.complete.postman_collection.json`
- `BudgetOverflow.local.postman_environment.json`

### Instructions:
1. Import both files into Postman.
2. Select the environment: **Budget Overflow - Local**.
3. Run the collection: **Budget Overflow Backend (Local) – Complete**.

---

## 📁 Useful Scripts

### Server
- `npm run migrate:latest` – Run latest DB migrations
- `npm run seed:run` – Seed database

### Client
- `npm run dev` – Start local dev server
- `npm run build` – Build for production
- `npm run preview` – Preview production build
- `npm run lint` – Run ESLint checks

---

## 🔐 Auth Flow Overview

- JWT-based access and refresh token system.
- Refresh tokens stored in `HttpOnly` cookies.
- Access token stored in memory and refreshed automatically.
- Protected routes guarded using a `PrivateRoute` component on the frontend.

---

## 📊 Features

- ✅ User registration, login, logout, name and password change
- ✅ Persistent sessions with token refresh
- ✅ Create / edit / delete transactions
- ✅ Auto-category selection
- ✅ Responsive dark mode UI
- ✅ Transaction history with filters and pagination
- ✅ Export transactions to CSV
- ✅ Interactive income/expense graph

---

## 🧑‍💻 Author

**Ahmad Amireh**  
GitHub: [@ahmadxamireh](https://github.com/ahmadxamireh)

---

## 📜 License

MIT
