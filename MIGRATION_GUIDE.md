# Frontend Migration Guide

## ✅ Что реализовано

### 1. **React Router**
- ✅ Установлен `react-router-dom@7.13.0`
- ✅ Миграция с hash-routing на `BrowserRouter`
- ✅ Чистые URL (`/marketplace`, `/profile`, `/product/:id`)
- ✅ Защищённые маршруты через `ProtectedRoute`
- ✅ Поддержка browser back/forward

### 2. **JWT Authentication**
- ✅ Сервис `services/authService.ts` с:
  - Axios interceptors для автоматической подстановки токенов
  - Автоматическое обновление токенов при 401
  - Безопасное хранение токенов
  - Mock-режим для разработки
- ✅ Интеграция с `AuthContext`
- ✅ Автоматический logout при истечении токена

### 3. **Защищённые маршруты**
- ✅ `/profile` требует авторизации
- ✅ Автоматический редирект на `/login`
- ✅ Сохранение URL для возврата после логина

### 4. **Режим разработки**
- ✅ Работает без бэкенда (mock auth)
- ✅ Тестовые данные: `123@123.com` / `123123`
- ✅ Graceful fallback при недоступности API

## 📁 Структура проекта

```
mnostva-art/
├── services/
│   └── authService.ts          # JWT auth с interceptors
├── components/
│   ├── ProtectedRoute.tsx      # Guard для защищённых маршрутов
│   └── Navbar.tsx              # Навигация с React Router
├── context/
│   └── AuthContext.tsx         # Контекст авторизации
├── pages/
│   ├── LoginPage.tsx           # Страница входа/регистрации
│   ├── ProfilePage.tsx         # Профиль пользователя
│   ├── MarketplacePage.tsx     # Каталог продуктов
│   ├── ProductDetailPage.tsx   # Детали продукта
│   └── CheckoutPage.tsx        # Оформление заказа
├── App.tsx                     # Главный компонент с роутингом
├── .env.example                # Шаблон переменных окружения
└── vite.config.ts              # Конфигурация Vite
```

## 🚀 Быстрый старт

### Разработка (без бэкенда)

```bash
npm install
npm run dev
```

Вход с тестовыми данными:
- Email: `123@123.com`
- Password: `123123`

### Production (с бэкендом)

1. **Настройте переменные окружения:**
   ```bash
   cp .env.example .env
   ```

2. **Укажите URL API в `.env`:**
   ```env
   VITE_API_URL=https://api.mnostva.com/api
   ```

3. **Соберите проект:**
   ```bash
   npm run build
   npm run preview
   ```

## 🔐 Безопасность

### Реализовано
- ✅ JWT-авторизация
- ✅ Автообновление токенов
- ✅ Защищённые маршруты
- ✅ Axios interceptors для auth headers
- ✅ Автоматический logout при истечении токена

### Рекомендуется для Production
- 🔲 HTTPS (обязательно)
- 🔲 HttpOnly cookies для refresh tokens
- 🔲 CORS whitelist
- 🔲 Rate limiting
- 🔲 Валидация паролей
- 🔲 CSP headers

## 🔧 Конфигурация

### Переменные окружения

Создайте `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

Production:
```env
VITE_API_URL=https://api.mnostva.com/api
```

### Vite Config

Vite автоматически загружает `.env` файлы. Дополнительная настройка не требуется.

## 🐛 Troubleshooting

### "Cannot find module 'react-router-dom'"
```bash
npm install react-router-dom axios jwt-decode
```

### "API request failed"
- Проверьте, запущен ли бэкенд
- Проверьте `VITE_API_URL` в `.env`
- Проверьте CORS в консоли браузера
- Frontend автоматически переключится на mock auth

### "Token expired"
- Токены обновляются автоматически
- При ошибке обновления — автоматический logout
- Проверьте endpoint `/api/auth/refresh` на бэкенде

### Роуты не работают после деплоя
Настройте сервер для SPA:

**Nginx:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

## 💡 Best Practices

### Навигация
```tsx
// Программная навигация
const navigate = useNavigate();
navigate('/marketplace');

// Декларативная навигация
<Link to="/marketplace">Shop</Link>
```

### Проверка авторизации
```tsx
const { user } = useAuth();
if (user) {
  // Пользователь авторизован
}
```

### Защищённые компоненты
```tsx
<ProtectedRoute>
  <ProfilePage />
</ProtectedRoute>
```

## 📖 Дополнительная документация

- **BACKEND_ARCHITECTURE.md** - Архитектура бэкенда (NestJS)
- **API_REFERENCE.md** - Справочник API endpoints
- **DEPLOYMENT.md** - Инструкции по деплою

---

**Статус:** ✅ Готово к production (с бэкендом)  
**Режим разработки:** ✅ Полностью функционален (mock auth)  
**Обратная совместимость:** ✅ Да
