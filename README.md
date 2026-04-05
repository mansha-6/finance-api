# Finance Data Processing and Access Control Backend

## Overview

This is a backend system for a finance dashboard, built with Node.js, Express, TypeScript, SQLite, and Prisma ORM.

It features robust user role management, financial records management, dashboard summary data provisioning, access control, and comprehensive API documentation.

## Features Let's Create!

- **User and Role Management**: Roles (Viewer, Analyst, Admin) with corresponding permissions.
- **Financial Records**: CRUD operations for financial records with pagination and filtering. 
- **Dashboard Summary API**: Endpoints for totals, net balances, category-wise breakdowns, and recent activities.
- **Access Control Logic**: Guarded endpoints based on JWT authentication.
- **Validation**: Strict input validation using Zod schemas.
- **API Documentation**: Interactive Swagger documentation.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize the database and run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

Swagger API documentation is available at `/api-docs` when the server is running.
Example: `http://localhost:3000/api-docs`

## Assumptions & Decisions

- **Database**: SQLite is used for simplicity and ease of setup for evaluation purposes.
- **ORM**: Prisma is used for type-safe database access and easy schema management.
- **Roles**:
  - `VIEWER`: Can view dashboard summaries but cannot view raw records or modify anything.
  - `ANALYST`: Can view dashboard summaries and view raw records. Cannot modify anything.
  - `ADMIN`: Full access to manage users and CRUD access to financial records.
- **Authentication**: Email/Password authentication using JWT tokens.
- **Validation**: Implementation uses Zod for type-safe and consistent payload validation returning standard error responses.

## Future Enhancements
- Soft deletes for records (can be easily implemented by adding a `deletedAt` field).
- Refresh tokens for secure long-lived sessions.
- Caching dashboard summaries using Redis for high-scale applications.
