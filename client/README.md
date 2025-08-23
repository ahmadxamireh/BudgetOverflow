# Budget Overflow – Frontend

This is the **React + TypeScript + Vite** frontend for the **Budget Overflow** app. It connects to a secure backend API and provides a responsive, feature-rich user interface for tracking income, expenses, and overall budgeting.

---

## 📦 Tech Stack

- **React 19** with TypeScript
- **Redux Toolkit** for state management
- **React Router v7**
- **Tailwind CSS v4** for styling
- **Heroicons** for UI icons
- **ApexCharts** for dynamic visualizations
- **Vite** for dev/build tooling

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ahmadxamireh/BudgetOverflow.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file based on the provided example:

```bash
cp .env.example .env
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔐 Authentication Flow

- Cookie-based authentication using `HttpOnly` access and refresh tokens.
- Session is restored automatically on app start via `/api/auth/me`.
- Private routes are protected with `<PrivateRoute />` wrapper.

---

## 🧪 Testing Flow (Manual)

- Register or log in using the provided UI.
- Add/edit/delete transactions.
- Filter and export transactions by date.
- View live charts and net balance updates.
- Navigate to `/settings` to change name/password.

---

## 🗂️ Project Structure

```
src/
├── api/              # Fetch logic (auth, categories, transactions)
├── components/       # Main UI sections (Dashboard, Auth, Transactions...)
├── models/           # Shared TypeScript types
├── state/            # Redux slices and store setup
└── util/             # Reusable helpers like exportToCSV, formatCurrency
```

---

## 🧰 Scripts

| Command         | Description                       |
|----------------|-----------------------------------|
| `npm run dev`   | Start the Vite dev server         |
| `npm run build` | Build the production-ready app    |
| `npm run preview` | Preview the production build    |
| `npm run lint`  | Run ESLint for code quality       |

---

## ⚙️ Environment Variables

```
VITE_API_URL=http://localhost:3000
```

---

## 🙋 Author

**Ahmad Amireh**  
[GitHub Profile](https://github.com/ahmadxamireh)
