# Daily Expense Manager

A comprehensive personal finance management application built with Next.js 16. This application allows users to track their incomes and outcomes, provides a clear dashboard with data visualizations and budget alerts, and supports both Vietnamese and English languages.

## 🚀 Features

*   **Transaction Management:** Full CRUD (Create, Read, Update, Delete) functionality for income and outcome transactions.
*   **Authentication & Authorization:** Secure user authentication with role-based access control (Admin/User) using NextAuth.
*   **Dashboard & Analytics:** A detailed dashboard featuring data visualization elements (using Recharts) to help track your financial health and budget alerts.
*   **Responsive Layout:** Features a modern, responsive three-panel layout optimized for both desktop and mobile views.
*   **Bilingual Support:** Full support for both English (EN) and Vietnamese (VN) languages.
*   **Database Setup:** Robust PostgreSQL database integration with Prisma ORM.

## 🛠️ Technology Stack

*   [Next.js 16](https://nextjs.org/) - React framework for the frontend and backend API endpoints.
*   [Prisma](https://www.prisma.io/) - Next-generation Node.js and TypeScript ORM.
*   [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js.
*   [PostgreSQL](https://www.postgresql.org/) - Reliable relational database.
*   [Recharts](https://recharts.org/) - Composable charting library built on React components.
*   [Zod](https://zod.dev/) - TypeScript-first schema validation.

## ⚙️ Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm (or yarn/pnpm/bun)

### 1. Clone & Install Dependencies

Open your terminal and install all required packages:

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory (if it doesn't already exist) and ensure it has the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/daily_expense_manager?schema=public"
NEXTAUTH_SECRET=super-secret-key-daily-expense-manager-2026  
NEXTAUTH_URL=http://localhost:3000 
```

### 3. Initialize the Database

Generate the Prisma Client and sync your schema with the PostgreSQL database:

```bash
npx prisma generate
npx prisma db push
```
*(Alternatively, you can run `npx prisma migrate dev --name init` to create a migration history).*

### 4. Seed the Database (Optional)

To populate the database with initial sample data (e.g., creating the first Admin account or dummy transactions), run the seed script:

```bash
npm run seed
```

### 5. Start the Development Server

Finally, run the app in development mode:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🐳 Running with Docker

You can easily run the entire application using Docker. The provided Dockerfile is configured to automatically generate the Prisma client, migrate the database, and seed initial data during the build process.

### 1. Build the Docker Image

```bash
docker build -t daily-expense-app .
```

### 2. Run the Container

```bash
docker run -d -p 3000:3000 --name expense-manager daily-expense-app
```

The application will be available at [http://localhost:3000](http://localhost:3000).

*(Note: Ensure your PostgreSQL server is accessible by the container via the `DATABASE_URL` environment variable.)*

## 💬 Additional Commands

| Command | Description |
| :--- | :--- |
| `npx prisma studio` | Opens a web browser GUI at `localhost:5555` to view and edit your database records directly. |
| `npm run build` | Builds the app for production usage. |
| `npm run start` | Starts the Next.js production server (requires `npm run build` beforehand). |
| `npm run lint` | Runs the Next.js linter to check for code issues. |
