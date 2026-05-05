# Project Rules — 3D Marketplace

## 🎯 Контекст проекта

**Тип:** Web-based marketplace для цифровых 3D моделей  
**Принципы:**
- Только цифровые товары
- Безопасный доступ к скачиванию с ограничением по времени
- Никакого публичного доступа к файлам
- Масштабируемая и экономичная архитектура

---

## 1️⃣ Хранение файлов

### ❌ ЗАПРЕЩЕНО
- Хранить файлы на сервере приложения
- Публичный доступ к bucket
- Ссылки на Google Drive / Dropbox
- Отправка файлов по email
- **Временные локальные решения (local fs storage) вместо cloud storage**

### ✅ РАЗРЕШЕНО
- Signed URLs с истечением (max 10 минут)
- Прямое скачивание клиентом из R2
- Хранение ВСЕХ файлов в Cloudflare R2
- **Решать проблемы интеграции (fix credentials), а не использовать костыли (workarounds)**

**Правило:**
```typescript
// ✅ Правильно
const signedUrl = await r2Service.generateSignedUrl(fileKey, 600);

// ❌ Неправильно
const publicUrl = `https://bucket.r2.dev/${fileKey}`;
```

---

## 2️⃣ Контроль доступа к скачиванию

### Валидация на бэкенде
1. Проверка авторизации пользователя
2. Проверка владения покупкой
3. Проверка лимитов скачивания

### Правила Signed URLs
- ❌ НИКОГДА не сохранять signed URLs в БД
- ✅ Генерировать новый URL при каждом запросе
- ✅ Максимальное время жизни: 10 минут

---

## 3️⃣ Payment Flow (Stripe)

### Жизненный цикл заказа
```
pending → paid → fulfilled
```

### Правила
- ✅ Stripe webhooks — **единственный источник истины**
- ❌ НЕ доверять подтверждению оплаты с клиента
- ✅ Доступ к продукту ТОЛЬКО после webhook confirmation
- ❌ Неоплаченные заказы НЕ дают доступ к скачиванию

```typescript
// ✅ Правильно
@Post('stripe/webhook')
async handleWebhook(@Body() event: StripeEvent) {
  if (event.type === 'payment_intent.succeeded') {
    await this.ordersService.markAsPaid(orderId);
  }
}
```

---

## 4️⃣ Ответственность бэкенда

### ДОЛЖЕН
- Авторизация и аутентификация
- Валидация покупок
- Генерация signed URLs
- Логирование активности скачивания

### НЕ ДОЛЖЕН
- Стримить большие файлы
- Быть прокси для скачивания
- Передавать storage credentials клиенту

---

## 5️⃣ Ответственность фронтенда

### Flow скачивания
```
1. User clicks "Download"
2. Frontend → POST /api/downloads/generate
3. Backend → validates + returns signed URL
4. Browser → downloads directly from R2
```

### Правила
- ❌ НЕ содержать storage credentials
- ❌ НЕ строить download URLs вручную
- ✅ Запрашивать URLs только через API

---

## 6️⃣ Database Rules

### Правила хранения
```typescript
// ✅ Правильно — хранить ключ (путь)
products.file_key = "products/product-123/model.zip"

// ❌ Неправильно — хранить URL
products.file_url = "https://r2.dev/products/..."
```

### Иммутабельность
- Записи о покупках **неизменяемы** после оплаты
- Удаление продукта **НЕ удаляет** историю заказов

---

## 7️⃣ Security Rules

### Принципы
- Весь клиентский input — **недоверенный**
- Все критичные операции требуют **авторизации**
- Rate-limit на генерацию signed URLs
- Логирование подозрительной активности

### Out of scope
- DRM системы
- Полная защита от копирования

---

## 8️⃣ Email Rules

### ❌ ЗАПРЕЩЕНО в emails
- Вложения с файлами
- Прямые download URLs
- Signed URLs

### ✅ РАЗРЕШЕНО
- Ссылки на user dashboard
- Информация о заказе

---

## 9️⃣ Масштабируемость

### Предпочтения
- ✅ Прямое скачивание из storage
- ❌ Использование bandwidth бэкенда
- ✅ Горизонтальное масштабирование

### Storage
**Cloudflare R2** — zero egress cost

---

## 🔟 Code Style

### TypeScript Rules
```typescript
// ✅ Правильно
strict: true
unknown вместо any
Explicit return types

// ❌ Запрещено
@ts-ignore
any
Unsafe casting
```

### Naming Conventions

**Files:**
```
download.service.ts
orders.controller.ts
create-order.dto.ts
```

**Classes:**
```typescript
class DownloadService { }
class OrdersController { }
class StripeWebhookHandler { }
```

**Functions:**
```typescript
// ✅ Правильно
generateSignedDownloadUrl()
validatePurchaseOwnership()
handleStripePaymentSucceeded()

// ❌ Неправильно
getData()
doStuff()
process()
```

**Variables:**
```typescript
const isUserAuthorized = true;
const hasActivePurchase = false;
const canDownload = true;
```

**Environment Variables:**
```env
STRIPE_SECRET_KEY
R2_ACCESS_KEY
DATABASE_URL
```

---

## 1️⃣1️⃣ Error Handling

### Правила
- ❌ НЕ бросать raw errors
- ✅ Domain-specific errors
- ❌ НЕ раскрывать infrastructure details

```typescript
// ✅ Правильно
throw new PurchaseNotFoundError();
throw new DownloadLimitExceededError();
throw new PaymentNotConfirmedError();

// ❌ Неправильно
throw new Error('Something went wrong');
```

---

## 1️⃣2️⃣ Testing (Jest)

### Coverage Requirements
- **Statements:** ≥80%
- **Branches:** ≥80%
- **Functions:** ≥80%
- **Lines:** ≥80%

### ДОЛЖНО быть протестировано
- Валидация покупок
- Авторизация скачивания
- Генерация signed URLs
- Stripe webhook handlers
- Edge cases и сценарии злоупотребления

### НЕ ДОЛЖНО тестироваться
- Внутренности внешних SDK
- UI frameworks
- Cloud provider internals

### Test Structure
```typescript
// ✅ Правильно
it('denies download if user has not purchased the product', async () => {
  await expect(
    service.generateDownloadUrl(userId, productId)
  ).rejects.toThrow(PurchaseNotFoundError);
});

// ❌ Неправильно
it('works', () => { });
```

---

## 📋 Quick Reference

| Компонент | Технология | Правило |
|-----------|-----------|---------|
| Storage | Cloudflare R2 | Signed URLs only |
| Payments | Stripe | Webhooks = truth |
| Auth | JWT | Access + Refresh |
| Database | PostgreSQL | Store keys, not URLs |
| Testing | Jest | ≥80% coverage |
| Backend | NestJS | TypeScript strict |

---

## 1️⃣3️⃣ CI/CD & Git Workflow

### Git Standards
- ✅ **Обязательный запуск тестов перед `git push`**
- ❌ **ЗАПРЕЩЕНО** пушить код с упавшими тестами
- ✅ Если тесты упали — сначала фиксим, потом пушим

### Команды для проверки
```bash
# Backend
cd backend && npm test

# Frontend
npm test
```

---

**См. также:**
- `BACKEND_ARCHITECTURE.md` — Детальная архитектура
- `API_REFERENCE.md` — API endpoints
- `README_DOCS.md` — Навигация по документации
