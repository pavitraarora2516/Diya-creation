# API ENDPOINT AUDIT — DIYA CREATION

This document catalogs every API endpoint discovered in the **Diya Creation** NestJS backend.

---

## 1. Authentication Module (`/api/auth`)

### Register Customer
*   **Method**: `POST`
*   **Route**: `/api/auth/register`
*   **Auth Required**: No
*   **Request Body**:
    ```json
    {
      "email": "customer@example.com",
      "password": "Password@123",
      "name": "Jane Doe"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "user": {
        "id": "uuid-string",
        "email": "customer@example.com",
        "name": "Jane Doe",
        "role": "CUSTOMER"
      },
      "token": "jwt-access-token"
    }
    ```
*   **Database Actions**: Inserts `User` record with reference to `CUSTOMER` role, hashes password with `bcrypt`, and creates empty `Cart` record.

---

### Login User
*   **Method**: `POST`
*   **Route**: `/api/auth/login`
*   **Auth Required**: No
*   **Request Body**:
    ```json
    {
      "email": "customer@example.com",
      "password": "Password@123"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "user": {
        "id": "uuid-string",
        "email": "customer@example.com",
        "name": "Jane Doe",
        "role": "CUSTOMER"
      },
      "token": "jwt-access-token"
    }
    ```

---

### Get Profile
*   **Method**: `GET`
*   **Route**: `/api/auth/profile`
*   **Auth Required**: Yes (`JwtAuthGuard`)
*   **Response (200 OK)**:
    ```json
    {
      "id": "uuid-string",
      "email": "customer@example.com",
      "name": "Jane Doe",
      "role": "CUSTOMER",
      "permissions": ["products.view"]
    }
    ```

---

## 2. Products Module (`/api/products`)

### Get All Categories
*   **Method**: `GET`
*   **Route**: `/api/products/categories`
*   **Auth Required**: No

---

### Create Category
*   **Method**: `POST`
*   **Route**: `/api/products/categories`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: Roles with `products.create` permission (e.g. `SUPER_ADMIN`)
*   **Request Body**:
    ```json
    {
      "name": "Exclusive Truffles",
      "slug": "exclusive-truffles",
      "description": "Rich handcrafted truffles"
    }
    ```

---

### Get Products (Filtered Catalog)
*   **Method**: `GET`
*   **Route**: `/api/products`
*   **Auth Required**: No
*   **Query Parameters**: `category`, `search`, `minPrice`, `maxPrice`, `isFeatured`, `sort`

---

### Get Product by ID
*   **Method**: `GET`
*   **Route**: `/api/products/:id`
*   **Auth Required**: No

---

### Get Product by Slug
*   **Method**: `GET`
*   **Route**: `/api/products/slug/:slug`
*   **Auth Required**: No

---

### Get All Products (Admin)
*   **Method**: `GET`
*   **Route**: `/api/products/admin`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: Roles with `products.view` permission

---

### Create Product
*   **Method**: `POST`
*   **Route**: `/api/products`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: Roles with `products.create` permission
*   **Request Body**:
    ```json
    {
      "sku": "CHOC-TREAT-01",
      "name": "Artisanal Treat Box",
      "description": "Delicious box",
      "price": 350.00,
      "costPrice": 150.00,
      "stock": 100,
      "categoryId": "category-uuid",
      "customizable": false
    }
    ```

---

### Update Product
*   **Method**: `PUT`
*   **Route**: `/api/products/:id`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: Roles with `products.edit` permission

---

### Delete Product
*   **Method**: `DELETE`
*   **Route**: `/api/products/:id`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: Roles with `products.delete` permission

---

## 3. Hampers Module (`/api/hampers`)

### Get Hamper Boxes
*   **Method**: `GET`
*   **Route**: `/api/hampers/boxes`
*   **Auth Required**: No

---

### Create Hamper Box
*   **Method**: `POST`
*   **Route**: `/api/hampers/boxes`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `products.create`

---

### Get Hamper Components
*   **Method**: `GET`
*   **Route**: `/api/hampers/components`
*   **Auth Required**: No

---

### Create Hamper Component
*   **Method**: `POST`
*   **Route**: `/api/hampers/components`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `products.create`

---

### Build Hamper
*   **Method**: `POST`
*   **Route**: `/api/hampers/build`
*   **Auth Required**: No
*   **Request Body**:
    ```json
    {
      "boxId": "box-uuid",
      "wrapping": "Satin wrapping",
      "ribbonColor": "Red",
      "greetingMsg": "Happy Birthday!",
      "items": [
        { "componentId": "comp-uuid-1", "quantity": 2 },
        { "componentId": "comp-uuid-2", "quantity": 1 }
      ]
    }
    ```

---

### Get Hamper Details
*   **Method**: `GET`
*   **Route**: `/api/hampers/:id`
*   **Auth Required**: No

---

## 4. Orders & Cart Module (`/api/orders`)

### Get Cart
*   **Method**: `GET`
*   **Route**: `/api/orders/cart`
*   **Auth Required**: Yes (`JwtAuthGuard`)

---

### Add Item to Cart
*   **Method**: `POST`
*   **Route**: `/api/orders/cart`
*   **Auth Required**: Yes (`JwtAuthGuard`)
*   **Request Body**:
    ```json
    {
      "productId": "product-uuid",
      "hamperId": null,
      "quantity": 1,
      "customizations": "{\"engravedText\":\"For Mum\"}"
    }
    ```

---

### Remove Item from Cart
*   **Method**: `DELETE`
*   **Route**: `/api/orders/cart/:itemId`
*   **Auth Required**: Yes (`JwtAuthGuard`)

---

### Checkout Cart
*   **Method**: `POST`
*   **Route**: `/api/orders/checkout`
*   **Auth Required**: Yes (`JwtAuthGuard`)
*   **Request Body**:
    ```json
    {
      "shippingAddress": "123 Lane, Mumbai",
      "billingAddress": "123 Lane, Mumbai",
      "paymentMethod": "COD",
      "couponCode": "FESTIVAL50"
    }
    ```

---

### Track Order by Number
*   **Method**: `GET`
*   **Route**: `/api/orders/tracking/:orderNumber`
*   **Auth Required**: No

---

### Get Customer Orders
*   **Method**: `GET`
*   **Route**: `/api/orders`
*   **Auth Required**: Yes (`JwtAuthGuard`)

---

### Get All Orders (Admin)
*   **Method**: `GET`
*   **Route**: `/api/orders/admin`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `orders.view`

---

### Update Order Status (Admin)
*   **Method**: `PUT`
*   **Route**: `/api/orders/:id/status`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `orders.update`

---

### Payment Webhook (Razorpay Callback)
*   **Method**: `POST`
*   **Route**: `/api/orders/payment-webhook`
*   **Auth Required**: No (Cryptographic validation verified via `x-razorpay-signature` header)

---

## 5. Wishlist Module (`/api/wishlist`)

### Get Wishlist
*   **Method**: `GET`
*   **Route**: `/api/wishlist`
*   **Auth Required**: Yes (`JwtAuthGuard`)

---

### Add Product to Wishlist
*   **Method**: `POST`
*   **Route**: `/api/wishlist/:productId`
*   **Auth Required**: Yes (`JwtAuthGuard`)

---

### Remove Product from Wishlist
*   **Method**: `DELETE`
*   **Route**: `/api/wishlist/:productId`
*   **Auth Required**: Yes (`JwtAuthGuard`)

---

## 6. Review Module (`/api/reviews`)

### Submit Review
*   **Method**: `POST`
*   **Route**: `/api/reviews`
*   **Auth Required**: No

---

### Get Product Reviews
*   **Method**: `GET`
*   **Route**: `/api/reviews/product/:productId`
*   **Auth Required**: No

---

### Get All Reviews (Admin)
*   **Method**: `GET`
*   **Route**: `/api/reviews/admin`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `products.view`

---

### Moderate Review Status (Admin)
*   **Method**: `PUT`
*   **Route**: `/api/reviews/admin/:id`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `products.edit`

---

### Delete Review (Admin)
*   **Method**: `DELETE`
*   **Route**: `/api/reviews/admin/:id`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `products.delete`

---

## 7. CMS Module

### Get All Blogs
*   **Method**: `GET`
*   **Route**: `/api/blog`
*   **Auth Required**: No

---

### Get Blog by Slug
*   **Method**: `GET`
*   **Route**: `/api/blog/:slug`
*   **Auth Required**: No

---

### Create Blog (Admin)
*   **Method**: `POST`
*   **Route**: `/api/blog`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `products.create`

---

### Delete Blog (Admin)
*   **Method**: `DELETE`
*   **Route**: `/api/blog/:id`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `products.delete`

---

### Get Platform Setting
*   **Method**: `GET`
*   **Route**: `/api/cms/settings/:key`
*   **Auth Required**: No

---

### Update Platform Setting (Admin)
*   **Method**: `PUT`
*   **Route**: `/api/cms/settings/:key`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `reports.view`

---

## 8. Corporate Gifting Module (`/api/corporate`)

### Submit Inquiry Lead
*   **Method**: `POST`
*   **Route**: `/api/corporate/lead`
*   **Auth Required**: No

---

### Get Leads (Admin)
*   **Method**: `GET`
*   **Route**: `/api/corporate/leads`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `orders.view`

---

### Update Lead Status (Admin)
*   **Method**: `PUT`
*   **Route**: `/api/corporate/leads/:id/status`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `orders.update`

---

### Issue Quotation (Admin)
*   **Method**: `POST`
*   **Route**: `/api/corporate/quotation`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `orders.update`

---

### Get quotations by Lead ID (Admin)
*   **Method**: `GET`
*   **Route**: `/api/corporate/quotations/:leadId`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `orders.view`

---

## 9. Admin Dashboard Module (`/api/admin`)

### Get Dashboard Statistics
*   **Method**: `GET`
*   **Route**: `/api/admin/dashboard`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `reports.view`

---

### Get Customization Review Queue
*   **Method**: `GET`
*   **Route**: `/api/admin/customization-queue`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `customizations.review`

---

### Review Customization Choice
*   **Method**: `PUT`
*   **Route**: `/api/admin/customization-queue/:itemId`
*   **Auth Required**: Yes (`JwtAuthGuard`, `PermissionsGuard`)
*   **Role Required**: `customizations.review`

---

## 10. Added Production Endpoints

### Forgot Password
*   **Method**: `POST`
*   **Route**: `/api/auth/forgot-password`
*   **Auth Required**: No
*   **Request Body**:
    ```json
    {
      "email": "customer@example.com"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "message": "If this email is registered, you will receive a reset link."
    }
    ```
*   **Rate Limit**: 3 requests per 15 minutes per IP

---

### Reset Password
*   **Method**: `POST`
*   **Route**: `/api/auth/reset-password`
*   **Auth Required**: No
*   **Request Body**:
    ```json
    {
      "email": "customer@example.com",
      "token": "reset-token-string",
      "newPassword": "NewPassword@123"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "message": "Password has been reset successfully. Please login with your new password."
    }
    ```
*   **Rate Limit**: 5 requests per 15 minutes per IP

---

### Validate Coupon Code
*   **Method**: `POST`
*   **Route**: `/api/orders/coupon/validate`
*   **Auth Required**: Yes (`JwtAuthGuard`)
*   **Request Body**:
    ```json
    {
      "code": "WELCOME10"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "code": "WELCOME10",
      "discount": 10.0,
      "type": "PERCENTAGE",
      "isActive": true
    }
    ```

