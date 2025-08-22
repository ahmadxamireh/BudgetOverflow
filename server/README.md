# Budget Overflow – Backend API

This project implements a secure and fully tested backend API for the **Budget Overflow** budgeting application.

---

## Requirements

- Node.js 18+
- PostgreSQL
- npm

---

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ahmadxamireh/BudgetOverflow.git
```

2. Install dependencies:

```bash
npm install
```

3. Configure your `.env` file with database and JWT secrets.
4. Run database migrations and seeds:

```bash
npm run migrate:latest
npm run seed:run
```

5. Start the server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000` by default.

---

## Testing with Postman

Postman test files are provided for quick setup and verification.

### Files:
- **Environment**: `BudgetOverflow.local.postman_environment.json`
- **Collection**: `BudgetOverflow.complete.postman_collection.json`

### Import into Postman:
1. Open Postman.
2. Click **Import** → **Upload Files**.
3. Select both files above and import.
4. Choose the `Budget Overflow - Local` environment in the top-right dropdown.

### Running the tests:
1. In Postman, select the `Budget Overflow Backend (Local) – Complete` collection.
2. Click **Run** (Collection Runner).
3. Ensure the correct environment is selected.
4. Run all requests to verify API functionality.

---

## API Endpoints Overview

### 🔐 Authentication
- **POST** `/api/auth/register` – Register a new user.
- **POST** `/api/auth/login` – Log in and receive tokens.
- **GET** `/api/auth/me` – Get the logged-in user's profile.
- **POST** `/api/auth/refresh` – Refresh the access token.
- **POST** `/api/auth/logout` – Log out and clear refresh token.
- **PATCH** `/api/auth/profile` – Update first/last name.
- **POST** `/api/auth/change-password` – Change user password.

### 🗂 Categories
- **GET** `/api/categories` – List all categories (global and user-created).
- **POST** `/api/categories` – Create a new category.

### 💰 Transactions
- **POST** `/api/transactions` – Create a new transaction.
- **GET** `/api/transactions` – List transactions with filters and pagination.
- **PATCH** `/api/transactions/:id` – Update a transaction.
- **DELETE** `/api/transactions/:id` – Delete a transaction.

---

## Notes

- The provided Postman collection automatically saves `categoryId` and `txId` from responses to be used in subsequent requests.
- Authenticated requests require the `accessToken` variable in Postman, which is set automatically after login.

---
## Author

**Ahmad Amireh**  
[GitHub Profile](https://github.com/ahmadxamireh)