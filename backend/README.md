# Mnostva Art - Backend Setup

This backend is built with **NestJS**, **PostgreSQL**, and **TypeORM**. It handles authentication, product management, and order processing.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update the values, especially `DATABASE_URL` and `JWT_SECRET`.

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Database Setup
Make sure PostgreSQL is running and create a database named `mnostva`.

### 5. Run the Application
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## 📂 Project Structure
- `src/auth`: Authentication logic (JWT, Register, Login)
- `src/users`: User management
- `src/products`: Product catalog
- `src/orders`: Order processing
- `src/payments`: Stripe integration
- `src/downloads`: Secure file download logic (R2)

## 🔗 API Endpoints
See `http://localhost:3001/api` for the base URL.
- `POST /auth/register`: Create account
- `POST /auth/login`: Login
- `GET /products`: List products
- `POST /orders`: Create order

## 🛠️ Testing
```bash
npm run test
npm run test:e2e
```
