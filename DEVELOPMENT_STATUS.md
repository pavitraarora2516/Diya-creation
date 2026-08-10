# Development Status - Diya Creation

This document outlines the audit findings, architecture decisions, database status, API status, frontend/admin pages, and verification plans for the **Diya Creation** platform.

---

## 1. Existing Functionality

### Customer Storefront (Next.js Client)
*   **Homepage**: Hero banner, pillars/highlights, featured products, and custom navigation layout. Integrates `ThreeHero` for 3D gift-box floating/rotating scene.
*   **Shop Catalog**: Dynamic listings with filtering (by category, price range, search) and sorting (price high-to-low, low-to-high, alphabetical).
*   **Product Detail**: Renders descriptions, stock levels, variants, and price. Integrates `ThreeProductViewer` to preview texture mapping onto a 3D Wooden Photo Frame using user-uploaded files.
*   **Hamper Builder**: Step-by-step wizard (Box -> Fillings -> Gift items -> Custom wrapper accent -> Greeting card messages) with capacity validation.
*   **Cart & Checkout**: Cart state persists inside a Zustand store. Checkout captures shipping details, discounts, shipping fee rules, and payment options (COD or Online).
*   **Track Order**: Timeline visualizer that renders order state transitions (`PENDING_PAYMENT`, `CONFIRMED`, `SHIPPED`, `DELIVERED`) with carrier information.
*   **User Auth**: Login/Signup forms that cache JWTs in local storage.

### NestJS Backend (API Server)
*   **Auth Module**: Validates credentials, issues JWT access tokens, and processes current user profile extraction.
*   **Products Module**: Rest endpoints for product search, slug resolving, and listing. Includes Category CRUD.
*   **Hampers Module**: Configures available hamper box styles and individual ingredients, verifying limits on build requests.
*   **Orders Module**: CRUD for cart items, transactional orders creation (updating product and component stock levels), status progression, and track retrieval.
*   **Corporate Module**: Collects event inquiry details and converts them to quotations.
*   **Admin Module**: Computes total revenue, orders counts, average order value (AOV), and top-selling creations.

---

## 2. Missing & Incomplete Functionality

*   **Standalone Admin App**: Admin features are currently bundled directly inside the customer client under `/src/app/admin`, violating route and security isolation principles.
*   **PostgreSQL Migration**: The database client is programmatically configured with `better-sqlite3` driver adapters and local `dev.db`, even though `schema.prisma` specifies `postgresql`.
*   **Review & Moderation**: Review forms and backend moderation mechanisms (approve, reject, hide reviews) are missing.
*   **Wishlist Module**: Persistent database storage for wishlist items is completely unimplemented.
*   **CMS Management**: Slider banners, announcement bars, homepage layout configs, FAQs, and sitemaps are static client code rather than CMS models.
*   **Notifications Engine**: No backend mail/SMS service or processing queues exist for order/shipment updates.
*   **Infrastructure Layout**: Missing `docker-compose.yml` for PostgreSQL/Redis services and configuration templates.
*   **Automated Tests**: Unit tests, integration tests, and E2E browser verification pipelines are unconfigured.

---

## 3. Database Status & Schema Audit

| Model Name | Status | Key Fields & Indexes |
| :--- | :--- | :--- |
| `User` | Active | ID (UUID), Email (Unique index) |
| `Role` / `Permission` | Active | ID, Name (Unique indexes) |
| `Product` / `Category` | Active | SKU (Unique), Slug (Unique index) |
| `HamperBox` / `Hamper` | Active | ID, boxId (Foreign keys) |
| `Order` / `OrderItem` | Active | OrderNumber (Unique index), Status enums |
| `Payment` / `Shipment` | Active | ID, orderId (Foreign keys) |
| `Wishlist` / `Review` | Incomplete | Relational indexes |
| `CorporateLead` / `Quotation` | Active | LeadId, QuoteNumber (Unique index) |
| `Coupon` / `Setting` | Active | Code (Unique), Key (Primary key) |
| `AuditLog` | Incomplete | Persists core admin operations |

---

## 4. API Status & Integration

*   **Authentication**: Secure passport-jwt integration is set up but lacks refresh token cookies and device-session logs.
*   **Transactional Safety**: Stock checks during checkout are grouped under `prisma.$transaction`. We must ensure Postgres transactional isolation levels are correctly utilized.
*   **Razorpay Integration**: Checkout uses a mock frontend payment bypass. Backend webhook verification needs real cryptographic checking.

---

## 5. Recommended Migration Plan

1.  **Infrastructure Initialization**: Set up PostgreSQL and Redis using Docker Compose. Update `schema.prisma` and `PrismaService` to use the standard PostgreSQL database provider and environment variables.
2.  **Separate Admin Console**: Create a dedicated frontend application under `/admin` using Next.js/Tailwind CSS/shadcn, and remove admin routes from `/frontend`.
3.  **Core Feature Extensions**: Build full Wishlist, Review, and CMS modules. Update database seeding logic to use `tsx` and load realistic corporate/customization states.
4.  **Advanced Checkout & Payment**: Configure Razorpay webhooks with SHA-256 signature verification in NestJS.
5.  **Notifications & Shipping**: Add transactional templates using email transport frameworks.
6.  **Tests & Security**: Set up unit tests, API tests, and Cypress/Playwright E2E verification.
