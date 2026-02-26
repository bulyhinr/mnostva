# Project Backlog & Roadmap

This document tracks planned features, improvements, and automation tasks for the Mnostva Art Marketplace.

## 🚀 Automation & Notifications (High Priority)

The goal is to implement a cost-effective and reliable email delivery system.

**Recommended Solution: [Resend](https://resend.com)**
*   **Why?**
    *   **Generous Free Tier:** 3,000 emails/month for free (perfect for starting).
    *   **Developer Experience:** Extremely easy to integrate with NestJS and React.
    *   **Modern:** Supports React-Email for building beautiful templates using code.
*   **Alternative:** **AWS SES** (Cheapest at scale, but harder to set up).

**Tasks:**
### 3. Automation & Notifications (High Priority) - Completed ✅
- [x] **Setup Email Service**:
    - [x] Sign up for Resend (or chosen provider).
    - [x] Verify domain (DNS records).
    - [x] Integrate SDK into NestJS (`@nestjs-modules/mailer` or direct SDK).
- [x] **Welcome Email**:
    - [x] Create a "Welcome to Mnostva" email template.
    - [x] Trigger email upon successful user registration (`auth.service.ts`).
- [x] **Order Confirmation Email**:
    - [x] Create an "Order #123 Confirmed" email template.
    - [x] Include list of items, total price, and **direct download links** (or link to "My Assets").
    - [x] Trigger email in `OrdersService` after successful payment verification.
- [ ] **Payment Failed / Recovery Email**:
    - [ ] Send an email if payment fails or card is declined, with a link to retry (`/checkout?orderId=...`).

---

## 🌟 Current Focus

### 1. Reviews & Ratings (Completed ✅)
- [x] **Backend**:
    - [x] Create `Review` entity (User, Product, Rating 1-5, Comment).
    - [x] Create `ReviewsController` (POST /reviews, GET /products/:id/reviews).
    - [x] Implement logic: User can only review products they have purchased.
- [x] **Frontend**:
    - [x] Display Star Rating on Product Detail Page.
    - [x] "Leave a Review" button in **User Profile** -> **My Assets** for purchased items.
    - [x] Review Form Modal.

### 2. Wishlist / Favorites (Completed ✅)
- [x] **Backend**:
    - [x] Create `Wishlist` entity (User, Product).
    - [x] Endpoint to Toggle Wishlist (Add/Remove).
- [x] **Frontend**:
    - [x] Add "Heart" icon to Product Cards and Detail Page.
    - [x] Create "Saved for Later" tab in User Profile.

---



## 🛠 Technical Improvements & Refactoring

- [ ] **Fix Order Quantity Bug**:
    - [ ] *Issue:* Adding multiple quantities of the same item to an existing unpaid order displays as a single item.
    - [ ] *Fix:* Update cart merging logic in `OrdersService`.
- [ ] **Database Backup**:
    - [ ] Automate daily backups of the PostgreSQL database.
- [ ] **Error Monitoring**:
    - [ ] Integrate **Sentry** (free tier available) to track backend and frontend errors in real-time.
- [x] **SEO Optimization**:
    - [x] Add `react-helmet-async` for dynamic Open Graph tags (Title, Image, Description) for every product page.
    - [x] Generate `sitemap.xml` for Google indexing (added dynamic backend API `/api/sitemap.xml`).
    - [x] Update `robots.txt` configuration to guide crawlers to `/api/sitemap.xml` effectively.
    - [x] Optimize images natively to modern formats (WebP format with fallback) and lazy loading below-the-fold content for better Core Web Vitals (added 'lazy' loading and programmatic fallback).
    - [x] Add Structured Data (JSON-LD) for Products so Google creates Rich Snippets (displaying price and rating directly on the search engine).
    - [x] Apply semantic HTML tags (`<article>`, `<aside>`) to marketplace listing blocks.
    - [ ] Consider rendering landing and product pages on edge (SSR/SSG via Next.js or similar) for faster time-to-first-byte (TTFB), if SPA proves slow for standard bots despite dynamic sitemaps (Deferred: requires major migration).

---

## 💳 Payment & Checkout Optimization

- [ ] **Guest Checkout**:
    - [ ] Allow users to buy without creating an account (send download link to email).
    - [ ] Auto-create "shadow" account or just store transaction.
- [x] **Discount Codes / Coupons**:
    - [x] Admin can generate status-based coupons (e.g., `SUMMER20`).
    - [x] Input field in Checkout Step 2.

---

## 🏆 Competitive Marketplace Features (Future Enhancements)

- [ ] **Interactive 3D WebGL Viewer**: 
    - Allow users to interactively rotate, zoom, and inspect assets directly on the product page. 
    - Support for PBR material previews, wireframe toggles, and animation playback directly in the browser.
- [ ] **Advanced Multi-Format Delivery**:
    - Support multiple specific formats per product (`.fbx`, `.obj`, `.blend`, `.gltf`, `.uasset`, `.unitypackage`).
    - Let users filter search results by required format and download exactly what they need.
- [ ] **Advanced Search & Filtering**:
    - Filter products by Poly-count (Low, Mid, High poly), Rigging status (Rigged vs Unrigged), Animation count, Texture resolutions (2K, 4K, 8K), and License type.
- [ ] **Creator Profiles & Multi-Vendor Readiness**:
    - Portfolio pages for artists with customizable URLs.
    - Follower system: Notify users when their favorite artist uploads a new pack.
    - Vendor sales analytics and payout dashboard.
- [ ] **Bundle Deals & Smart Upselling**:
    - "Frequently bought together" sections.
    - Dynamic cart discounts (e.g., "Buy 3 get 20% off").
- [ ] **Rich Media Presentations**:
    - Auto-generated 360° Turntable GIFs.
    - YouTube/Vimeo video embed support on the product detail gallery to show assets in action (gameplay).
- [ ] **Flexible Licensing & B2B Invoices**:
    - Tiered licenses: "Standard/Indie License" vs "Studio/Commercial License" with different pricing.
    - Automated PDF invoice generation with VAT details for business buyers.
- [ ] **Affiliate & Referral Program**: 
    - Allow users to generate referral links. Reward referrers with store credit or cash payouts.
- [ ] **Subscription Model (Pro Tier)**: 
    - Introduce a monthly subscription ("Mnostva Pass") granting X asset downloads per month or a global 30% discount.
