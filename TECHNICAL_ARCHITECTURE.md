# Technical Architecture: 3D Digital Marketplace

This document provides a comprehensive technical overview of the project architecture, designed to be used as a reference or a prompt for building similar secure digital goods marketplaces.

## 🎯 Core Concept
A high-performance, aesthetically premium marketplace for 3D assets (Rooms, Levels, Props, etc.). The system is built on the principle of **Zero Trust File Access**, where digital assets are never publicly accessible and are served via short-lived signed URLs.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Vanilla CSS + TailwindCSS (for utility-based components)
- **Animations**: Framer Motion, GSAP, and custom ScrollReveal patterns
- **State Management**: React Context (Cart, Auth)
- **Testing**: Vitest + React Testing Library
- **Routing**: React Router DOM v6

### Backend (Architecture Reference)
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL (Prisma ORM)
- **File Storage**: Cloudflare R2 (S3-compatible, zero egress costs)
- **Authentication**: JWT (Access + Refresh tokens)
- **Payments**: Stripe (Stripe Elements + Webhooks)

---

## 🏗 Key Architectural Patterns

### 1. Secure Asset Delivery (The R2 Pattern)
Assets are stored in a private Cloudflare R2 bucket. Access is strictly controlled via the backend.
- **No Public Access**: The bucket has no public URL.
- **Signed URLs**: When a user clicks "Download", the backend verifies the purchase and generates a **Presigned URL** with a short TTL (e.g., 10 minutes).
- **Direct Download**: The browser downloads the file directly from R2 using the signed URL, offloading bandwidth from the backend.

### 2. Payment Integrity (The Stripe Pattern)
- **Server-Side Truth**: The frontend uses Stripe Elements for a secure UI, but the order is only marked as `paid` or `fulfilled` upon receipt of a verified **Stripe Webhook**.
- **Idempotency**: Webhook handlers are designed to handle duplicate events without double-processing orders.
- **Order Lifecycle**: `pending` → `paid` (webhook received) → `fulfilled` (access granted).

### 3. Frontend Component Design
- **Premium Aesthetics**: Use of glassmorphism, smooth gradients, and micro-animations.
- **Performance**: Lazy loading of components and assets.
- **Atomic Components**: Highly reusable UI elements (Buttons, Cards, Modals) with standardized styling.

---

## 🔄 Core Data Flows

### A. Purchase Flow
1. **Client**: Adds items to Cart (CartContext).
2. **Client**: Initiates Checkout → Backend creates `Order` (status: `pending`) and `PaymentIntent`.
3. **Client**: Completes payment via Stripe Elements.
4. **Stripe**: Sends `payment_intent.succeeded` Webhook to Backend.
5. **Backend**: Verifies webhook, updates `Order` to `paid`, logs activity.
6. **Client**: Redirected to Success page, items appear in "My Library".

### B. Download Flow
1. **Client**: Clicks "Download" in Profile Library.
2. **Backend**: 
   - Validates User JWT.
   - Verifies if the user owns a `paid` order containing the `productId`.
   - Generates a signed URL from Cloudflare R2 SDK.
3. **Client**: Receives URL and triggers native browser download.

---

## 🛡 Security & Best Practices
- **Environment Isolation**: Strict use of `.env` for API URLs, Stripe keys, and R2 credentials.
- **Input Validation**: All client data is validated using DTOs and Class-Validator on the backend.
- **Rate Limiting**: Applied to sensitive endpoints like download generation and auth.
- **Testing Requirements**: Mandatory execution of the full test suite (`npx vitest run`) before any code push.

---

## 📋 Prompt Template for Replication
"Build a digital marketplace using React (Vite) and NestJS. Use Cloudflare R2 for private file storage and Stripe for payments. Implement a 'Signed URL' pattern for file downloads: the backend should verify purchase ownership before generating a 10-minute temporary link. Ensure the UI is premium/stylized with glassmorphism and smooth animations. Use Stripe Webhooks as the absolute source of truth for order status. Architecture must be scalable and follow a Zero-Trust file access model."
