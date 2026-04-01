# 🚀 API Documentation: Daily Expense Manager

This document provides a comprehensive overview of the Backend REST API endpoints and Frontend integration strategies for the **Daily Expense Manager** application.

---

## 🏗️ 1. Architecture Overview

- **Base Route:** `/api`
- **Authentication:** Sessions are managed securely via `NextAuth.js`. Most routes are protected and require a valid session cookie.
- **Data Format:** JSON (Both Request and Response).
- **Authorization Levels:**
  - `USER`: Can manage their own incomes, outcomes, and view their dashboard.
  - `ADMIN`: Has access to global statistics and system-wide data visibility.

---

## 🔐 2. Authentication API

Powered by **NextAuth**, authentication is seamlessly integrated into both the Backend and Frontend.

### `POST /api/auth/register`
Creates a new user account.
- **Request Body Payload:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (201):** `{ "message": "User completed registration." }`
- **Error Response (400):** `{ "error": "User already exists" }`

### `POST /api/auth/signin` & `POST /api/auth/signout`
Built-in credentials provider endpoints exposed automatically by NextAuth for session handling.

---

## 💰 3. Financial Transactions (Income & Outcome)

The application handles Incomes and Outcomes symmetrically. Operations below apply to both `/api/incomes` and `/api/outcomes`.

### `GET /api/outcomes`
Fetches a list of outcomes for the authenticated user, supporting filtering and searching.
- **Query Parameters:**
  - `category` (optional): Filter list by specific category (e.g., "Food", "Transport").
  - `search` (optional): Search query matching the `title` or `description`.
- **Success Response (200):**
  ```json
  [
    {
      "id": "cuid123",
      "title": "Groceries",
      "amount": 150000,
      "category": "Food",
      "date": "2026-04-01T00:00:00.000Z",
      "user": { "name": "Jane", "email": "jane@example.com" }
    }
  ]
  ```

### `POST /api/outcomes`
Records a new transaction (Income or Outcome) for the current user.
- **Request Body:**
  ```json
  {
    "title": "Groceries",
    "amount": 150000,
    "category": "Food",
    "description": "Weekly supermarket trip",
    "date": "2026-04-01"
  }
  ```
- **Success Response (201):** The newly created transaction object.

### `GET /api/outcomes/[id]`
Retrieves detailed information of a specific transaction based on its unique ID.

### `PUT /api/outcomes/[id]`
Updates an existing transaction.
- **Request Body:** Similar payload to POST request (Title, Amount, Category, etc.).
- **Success Response (200):** The updated transaction record.

### `DELETE /api/outcomes/[id]`
Permanently deletes a transaction.
- **Success Response (200):** `{ "message": "Transaction deleted successfully" }`

---

## 📊 4. Dashboard & Statistics

### `GET /api/stats`
Retrieves aggregated financial data specific to the logged-in user. Used heavily on the main User Dashboard.
- **Success Response (200):**
  ```json
  {
    "totalIncome": 5000000,
    "totalOutcome": 1500000,
    "balance": 3500000,
    "recentTransactions": [...]
  }
  ```

---

## 🛡️ 5. Admin Endpoints

Endpoints designed for the system administrators to monitor general app health and global user activity. Protected by the `"ADMIN"` role requirement.

### `GET /api/users`
Returns a list of all registered users on the system.

### `PUT /api/users/[id]`
Allows modifying user details, specifically allocating the `budgetLimit` or extending administrative `role` flags.

### `GET /api/admin/stats`
Retrieves a global overarching aggregation of all platform data.
- **Response Shape:** Total System Users, Global Net Incomes, Global Net Outcomes.

### `GET /api/admin/incomes` & `GET /api/admin/outcomes`
Fetches all recorded incomes/outcomes bypassing the individual user ownership filter (`where: { userId }`).

---

## 💻 6. Frontend Integration Examples

Here is how the sleek **Next.js 16 Client and Server Components** interact with these APIs.

### 🌐 Client-Side API Call Example
Using the built-in `fetch` API for submitting forms directly from the browser:

```typescript
// Creating a new Income from a React Component
const submitIncome = async (formData: IncomeData) => {
  const response = await fetch('/api/incomes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (response.ok) {
    const newIncome = await response.json();
    toast.success("Income recorded successfully!");
  } else {
    toast.error("Failed to add income");
  }
};
```

### 🖥️ Server-Side Fetching Example
Next.js Server Components securely fetching data during page render, reducing client bundle size:

```typescript
// Getting user stats directly inside a Server Component
import { cookies } from 'next/headers';

async function DashboardStats() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/stats`, {
    headers: {
      Cookie: cookies().toString() // Forward the session cookie
    },
    cache: 'no-store' 
  });
  
  const stats = await res.json();
  
  return (
    <div className="stats-grid">
       <Card title="Total Balance" value={stats.balance} />
    </div>
  );
}
```

---

## 🗺️ 7. Frontend Paths (Routes)

Below is the directory of available pages within the Next.js App Router:

### 🏠 Public Routes
- **`/`**: The landing experience of the application.
- **`/login`**: User authentication and sign-in page.
- **`/register`**: New user registration portal.

### 🔒 Protected Dashboard Routes
These routes require an active session and automatically redirect to `/login` if unauthenticated.
- **`/dashboard`** (or naturally **`/`** inside the dashboard layout): The main user view, showcasing charts, balance, and recent metrics.
- **`/income`**: Dedicated interface for viewing, filtering, and adding new Income transactions.
- **`/outcome`**: Dedicated interface for managing outgoings, expenses, and budget usage.

### 🛡️ Admin Routes
These routes are strictly accessible by users with the `"ADMIN"` role.
- **`/admin`**: The global administration dashboard displaying system-wide aggregate stats and usage metrics.
