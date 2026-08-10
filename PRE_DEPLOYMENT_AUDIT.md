# PRE-DEPLOYMENT AUDIT — DIYA CREATION

This document outlines the detailed findings from the complete pre-deployment audit of the **Diya Creation** workspace.

---

## 1. Project Discovery & Structure

The Diya Creation project is organized as a monorepo-style codebase containing three main components:
*   `/backend`: A NestJS API server providing services for products, orders, authentication, hamper builder, CMS, notifications, reviews, wishlists, and administrative operations.
*   `/frontend`: A Next.js-based client storefront for customers, featuring rich 3D animations and dynamic product configuration.
*   `/admin`: A standalone Next.js-based admin dashboard console for managing catalog, inventory, orders, customization reviews, quotations, corporate leads, and blogs.

### Directory Tree & Configurations
*   **Workspace Root**:
    *   `docker-compose.yml`: Provisions PostgreSQL (port `5432`) and Redis (port `6379`) services.
    *   `DEVELOPMENT_STATUS.md`: Initial documentation of the workspace.
*   **Backend (`/backend`)**:
    *   `package.json` & `package-lock.json`
    *   `prisma/schema.prisma`: Prisma ORM PostgreSQL models.
    *   `prisma.config.ts`: Configures datasource dynamically (resolves to PostgreSQL but defaults to sqlite `file:./dev.db` if not found).
    *   `src/`: Main NestJS module codebase (Auth, Products, Hampers, Orders, Corporate, Admin, Reviews, Wishlist, CMS, Notifications).
    *   `tsconfig.json` & `tsconfig.build.json`
    *   `eslint.config.mjs` & `.prettierrc`
*   **Customer Storefront (`/frontend`)**:
    *   `package.json` & `package-lock.json`
    *   `src/app/`: Next.js App Router (pages: Home, shop, product, hamper-builder, corporate, cart, checkout, track, login, register, profile, wishlist, blog).
    *   `src/components/`: 3D components (`ThreeHero`, `ThreeProductViewer`, `ThreeHamperBuilder`), Header, Footer.
    *   `src/store/`: Zustand client-side stores (`cartStore`, `authStore`).
    *   `src/utils/api.ts`: API client instance (currently hardcoded to `http://localhost:5000/api`).
*   **Admin Console (`/admin`)**:
    *   `package.json` & `package-lock.json`
    *   `src/app/page.tsx`: Main Admin Console panel dashboard (manages products, orders, customization reviews, corporate leads, blogs).
    *   `src/store/authStore.ts` & `src/utils/api.ts`: Zustand store and API configuration.

---

## 2. Technology Audit

| Component | Technology | Target Version | Status / Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | Runtime | `22.x LTS` | Active running version is `v24.14.1` on local machine. We will ensure Hostinger compatibility with Node 22.x. |
| **Package Manager** | npm | `11.12.1` | Native `package-lock.json` used across all components. |
| **Backend Framework** | NestJS | `v11.0.1` | Modern modular setup. Starts on port `5000`. |
| **Database ORM** | Prisma | `v7.9.1` | Schema is valid. No migration history folder is present. |
| **Frontend Framework** | Next.js | `v16.3.0` | Uses App Router and Tailwind CSS `v4` with `@tailwindcss/postcss`. |
| **3D Rendering** | WebGL / Three.js | `@react-three/fiber v9`, `@react-three/drei v10` | 3D models of frames, boxes, and hampers with graceful static fallback if WebGL is disabled. |

---

## 3. Environment & Secrets Audit

### Current Configurations
*   **Backend `.env`**:
    *   `DATABASE_URL`: Contains PostgreSQL password.
    *   `JWT_SECRET`: Hardcoded JWT signing key.
    *   `PORT`: `5000`
*   **Frontend & Admin**:
    *   No `.env` or `.env.example` files.
    *   `frontend/src/utils/api.ts` hardcodes `API_URL` to `http://localhost:5000/api`. This must be replaced with `process.env.NEXT_PUBLIC_API_URL` to support Hostinger production routing.

### Security Vulnerabilities Found
1.  **Exposed Credentials**: Hardcoded JWT secrets and PostgreSQL credentials committed in backend `.env`.
2.  **CORS Origin Bypass**: CORS configured with `origin: '*'` in `backend/src/main.ts`. This permits unauthorized cross-origin API calls and is a deployment blocker.
3.  **Razorpay Webhook Validation Bypass (Critical P0)**:
    In `backend/src/orders/orders.service.ts` line 420:
    ```typescript
    if (secret && signature) {
      // verifies hmac sha256
    }
    ```
    If the `signature` header is not provided, the HMAC check is completely bypassed, allowing anyone to POST a fake success response to `/api/orders/payment-webhook` and mark any order as paid.

---

## 4. System Status & Module Assessments

### A. Database Status
*   **Schema**: PostgreSQL provider is specified. The `schema.prisma` is valid but missing a `url` parameter in the `datasource db` block (this is handled in `prisma.config.ts`).
*   **Vulnerability**: The fallback in `prisma.config.ts` points to SQLite (`file:./dev.db`), which is incompatible with the PostgreSQL provider in the schema. Running `prisma migrate` or `prisma generate` will fail when `DATABASE_URL` isn't set or is set to SQLite.
*   **Required Fix**: Add proper database migration and seeding commands. Ensure SQLite is never used as a fallback for a PostgreSQL provider.

### B. Authentication & RBAC Status
*   **Password Hashing**: Done using `bcrypt` (10 rounds).
*   **Token Management**: Standard Passport JWT token used. Missing refresh token handling or session validation.
*   **RBAC**: Permissions are assigned to roles (`SUPER_ADMIN` and `CUSTOMER`). The `PermissionsGuard` checks endpoint permissions like `orders.view` and `products.create` server-side, which prevents unauthorized actions.
*   **Vulnerability**: Needs a cleanup to prevent empty permissions or roles initialization errors during first-time seeding.

### C. Payment & Transactional Safety Status
*   **Razorpay Integration**: Frontend triggers a mock webhook call to mark payment as successful or failed.
*   **Vulnerability**: Webhook lacks mandatory signature verification if no signature is passed. This is a critical P0 security bug.
*   **Stock Reservation**: Handled within a Prisma transaction (`prisma.$transaction`) during checkout. This prevents stock inconsistencies.

### D. Inventory Status
*   Stock levels are decremented in a database transaction during checkout.
*   Validation for products and components (chocolates, keychains, candles) is performed server-side.
*   If a product is out of stock, checkout is blocked.

### E. E-commerce Status (Cart, Wishlist, Checkout)
*   **Cart Store**: Handled client-side using Zustand. Merges and persists successfully.
*   **Wishlist**: Relational `Wishlist` table is defined. The API endpoints (`GET /api/wishlist`, `POST /api/wishlist/:productId`, `DELETE /api/wishlist/:productId`) are functional.
*   **Reviews**: Modulated review system is implemented in backend, supporting rating, verified purchaser detection (based on user name matching delivered orders), and admin moderation status (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`).

---

## 5. Deployment Blockers (P0 / P1 Severity)

### P0 (Critical Blockers - Fix Required before Deployment)
*   **P0-1**: **Razorpay Webhook Signature Bypass**. Strict signature checking must be enforced on `/api/orders/payment-webhook` if `RAZORPAY_WEBHOOK_SECRET` is configured.
*   **P0-2**: **CORS Configuration**. `main.ts` uses `origin: '*'`. Must be updated to target environment variables (`FRONTEND_URL`, `ADMIN_URL`).
*   **P0-3**: **Hardcoded API URL**. The frontend uses a hardcoded string `http://localhost:5000/api` which breaks in production. It must use `process.env.NEXT_PUBLIC_API_URL`.
*   **P0-4**: **Prisma config & local DB mismatch**. Mismatch between `postgresql` provider and sqlite database URL fallback in config file.

### P1 (High Blockers)
*   **P1-1**: **Missing /health Endpoint**. No health status check exists to monitor the server, PostgreSQL, and Redis connectivity.
*   **P1-2**: **Missing Environment Examples**. No `.env.example` files exist in frontend or admin.
*   **P1-3**: **No Automated Test Coverage**. Need unit/integration test suites to verify core actions (Auth, Catalog, Cart, checkout transaction, payment webhook, RBAC).

---

## 6. Recommended Fixes

1.  **Strict Payment Webhook verification**: Rewrite `processPaymentWebhook` in `orders.service.ts` to require a signature when a webhook secret is configured. Enable a sandbox test signature header bypass *only* in non-production environments to allow testing.
2.  **Environment Variables**: Create `.env.example` in `/backend`, `/frontend`, and `/admin`.
3.  **CORS Environment Bindings**: Update `main.ts` to load CORS origins from environment variables.
4.  **Health Check API**: Add a `GET /health` endpoint that checks the Node process, database connection, and Redis (optional/if needed).
5.  **Clean Build & Migration Suite**: Standardize deployment scripts for Hostinger Node.js Web App hosting.
