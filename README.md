Для включения "живых" платежей (Production Mode) на продакшене вам нужно выполнить несколько шагов по обновлению переменных окружения (Environment Variables) как на бэкенде, так и на фронтенде.

Вот подробная инструкция:

1. Подготовка в личных кабинетах
Stripe:

Войдите в Stripe Dashboard.
Переключите тумблер в верхней части экрана из Test Mode в Live Mode.
Перейдите в раздел Developers -> API Keys.
Скопируйте Publishable key и Secret key (они начинаются с pk_live_... и sk_live_...).
PayPal:

Войдите в PayPal Developer Portal.
Перейдите в Apps & Credentials.
Переключитесь на вкладку Live (не Sandbox!).
Создайте приложение или выберите существующее и скопируйте Client ID и Secret.
2. Обновление переменных на сервере (например, в Railway)
Вам нужно заменить текущие тестовые значения на боевые в настройках вашего хостинга (в разделе Variables).

Для Бэкенда (Backend):
Переменная	Значение
STRIPE_SECRET_KEY	Ваш Live Secret Key (sk_live_...)
PAYPAL_CLIENT_ID	Ваш Live Client ID от PayPal
PAYPAL_CLIENT_SECRET	Ваш Live Secret от PayPal
PAYPAL_API_BASE	Смените на https://api-m.paypal.com
Для Фронтенда (Frontend):
Переменная	Значение
VITE_STRIPE_PUBLISHABLE_KEY	Ваш Live Publishable Key (pk_live_...)
VITE_PAYPAL_CLIENT_ID	Ваш Live Client ID от PayPal (такой же как на бэкенде)
3. Проверка в коде
Убедитесь, что вы не захардкодили тестовые ключи. В текущей реализации:

Stripe (Frontend): Использует import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.
PayPal (Frontend): Использует import.meta.env.VITE_PAYPAL_CLIENT_ID в App.tsx.
Бэкенд: Все ключи берутся из ConfigService (переменные окружения).
4. Важные примечания
Stripe Webhooks: Если вы используете вебхуки Stripe для автоматического подтверждения заказов, вам нужно будет создать новый Endpoint в Stripe Dashboard (раздел Webhooks), указать URL вашего бэкенда (https://your-api.com/api/storage/webhook) и обновить переменную STRIPE_WEBHOOK_SECRET на сервере.
Минимальные суммы: Помните, что в Stripe минимальная сумма платежа обычно составляет 0.50 USD.
Валюта: Убедитесь, что валюта в PayPal и Stripe совпадает (USD).
После обновления переменных на сервере и перезапуска сервисов система начнет принимать реальные деньги. Рекомендую сначала провести один тестовый платеж на небольшую сумму (например, $1), используя реальную карту.

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
