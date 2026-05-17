# Mnostva Art Project

## 🎨 Overview

Mnostva Art is a marketplace for 3D assets, built with React (Frontend) and NestJS (Backend).

## 🚀 Getting Started

### Frontend
```bash
npm install
npm run dev
```
Runs at `http://localhost:3000`

### Backend
```bash
cd backend
npm install
npm run start:dev
```
Runs at `http://localhost:3001` (API at `/api`).

## 📚 Documentation
- [Documentation Index](./README_DOCS.md)
- [Backend Setup Guide](./backend/README.md)
- [Project Rules](./PROJECT_RULES.md)

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Three.js
- **Backend**: NestJS, PostgreSQL, TypeORM, Passport, JWT
- **Storage**: Cloudflare R2 (AWS S3 SDK)
- **Payments**: Stripe

## 📝 Configuration
Copy `.env.example` in both root and `backend/` directories to `.env` and configure your keys.
