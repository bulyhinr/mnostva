# Mnostva 3D Marketplace — Documentation Index

## 📚 Навигация по документации

### 🎯 Быстрый старт

1. **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** — Начните здесь
   - Что уже реализовано во frontend
   - Как запустить проект локально
   - Настройка переменных окружения
   - Troubleshooting

### 🏗️ Архитектура

2. **[BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)** — Архитектура бэкенда
   - Принципы работы с файлами (R2)
   - Схема базы данных (PostgreSQL)
   - Интеграция с Stripe
   - JWT Authentication
   - Security best practices
   - Code style и naming conventions
   - Testing requirements (Jest)

3. **[API_REFERENCE.md](./API_REFERENCE.md)** — Справочник API
   - Все endpoints с примерами
   - Request/Response форматы
   - Error handling
   - Rate limiting
   - cURL примеры для тестирования

### 🚀 Deployment

4. **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Инструкции по деплою *(coming soon)*
   - Frontend deployment (Vercel/Netlify)
   - Backend deployment (Railway/Render)
   - Database setup (Supabase/Neon)
   - Cloudflare R2 configuration
   - Stripe webhooks setup
   - Environment variables checklist

---

## 🔑 Ключевые концепции

### Frontend (React + Vite)
- **Router:** React Router v7 с чистыми URLs
- **Auth:** JWT (Access + Refresh tokens)
- **State:** Context API (Auth, Cart)
- **Styling:** Tailwind CSS (via CDN)
- **3D:** Three.js + React Three Fiber

### Backend (NestJS + PostgreSQL)
- **Framework:** NestJS (TypeScript strict mode)
- **Database:** PostgreSQL
- **Storage:** Cloudflare R2 (S3-compatible)
- **Payments:** Stripe
- **Auth:** JWT with refresh tokens
- **Testing:** Jest (≥80% coverage)

### Архитектурные правила

#### ❌ Запрещено
- Хранить файлы на сервере приложения
- Публичный доступ к файлам
- Доверять подтверждению оплаты с клиента
- Использовать `any` в TypeScript
- Стримить файлы через бэкенд

#### ✅ Разрешено
- Signed URLs с истечением (max 10 минут)
- Прямое скачивание из R2
- Stripe webhooks как источник истины
- Strict TypeScript
- Централизованная логика доступа к storage

---

## 📋 Чеклист для разработки

### Frontend
- [x] React Router настроен
- [x] JWT auth service реализован
- [x] Protected routes работают
- [x] Mock auth для разработки
- [ ] Интеграция с реальным API
- [ ] Stripe Checkout UI
- [ ] Download flow

### Backend
- [ ] NestJS проект инициализирован
- [ ] PostgreSQL schema создана
- [ ] JWT auth endpoints
- [ ] Products CRUD
- [ ] Orders & Checkout
- [ ] Stripe integration
- [ ] R2 signed URLs
- [ ] Download validation
- [ ] Webhooks
- [ ] Testing (≥80%)

### DevOps
- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] Database hosted
- [ ] R2 bucket configured
- [ ] Stripe webhooks configured
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] Monitoring setup

---

## 🛠️ Tech Stack

### Frontend
```
React 18.3.1
React Router 7.13.0
Vite 6.2.0
TypeScript 5.8.2
Axios
JWT-decode
Three.js
React Three Fiber
Tailwind CSS (CDN)
```

### Backend
```
NestJS
PostgreSQL
Cloudflare R2
Stripe
JWT (jsonwebtoken)
Bcrypt
Jest
TypeORM / Prisma
```

---

## 📞 Поддержка

**Вопросы по документации?**
- Проверьте соответствующий раздел выше
- Используйте поиск по файлам (Cmd/Ctrl + F)

**Нашли ошибку?**
- Создайте issue с описанием проблемы
- Укажите, какой документ содержит ошибку

---

## 📝 Changelog

### 2024-02-08
- ✅ Создана структура документации
- ✅ Frontend migration завершена
- ✅ Backend architecture описана
- ✅ API reference создан
- 🔄 Deployment guide в процессе

---

**Начните с [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) →**
