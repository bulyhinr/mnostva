# Backend Architecture — NestJS + PostgreSQL + Stripe + R2

## 📋 Обзор

Бэкенд для 3D Marketplace построен на:
- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL
- **Storage:** Cloudflare R2 (S3-compatible)
- **Payments:** Stripe
- **Auth:** JWT (Access + Refresh tokens)
- **Testing:** Jest (coverage ≥80%)

## 🏗️ Архитектурные принципы

### 1. Хранение файлов

**ПРАВИЛА:**
- ❌ НИКОГДА не храните файлы на сервере приложения
- ✅ ВСЕ цифровые активы хранятся в Cloudflare R2
- ❌ Файлы НЕ должны быть публично доступны
- ✅ Доступ ТОЛЬКО через signed URLs

**Разрешено:**
```typescript
// ✅ Генерация signed URL с истечением
const signedUrl = await this.r2Service.generateSignedUrl(fileKey, 600); // 10 минут
```

**Запрещено:**
```typescript
// ❌ Публичный доступ к bucket
// ❌ Ссылки на Google Drive / Dropbox
// ❌ Отправка файлов по email
```

### 2. Контроль доступа к скачиванию

**Валидация на бэкенде:**
1. Проверка авторизации пользователя
2. Проверка владения покупкой
3. Проверка лимитов скачивания (если включены)

**Правила signed URLs:**
- Максимальное время жизни: 10 минут
- Генерируется новый URL при каждом запросе
- ❌ НИКОГДА не сохраняйте signed URLs в БД

```typescript
// ✅ Правильно
@Get('download/:productId')
async getDownloadUrl(@Param('productId') productId: string, @User() user) {
  await this.validatePurchase(user.id, productId);
  return this.r2Service.generateSignedUrl(product.fileKey, 600);
}
```

### 3. Payment Flow (Stripe)

**Жизненный цикл заказа:**
```
pending → paid → fulfilled
```

**ПРАВИЛА:**
- ✅ Stripe webhooks — единственный источник истины
- ❌ НЕ доверяйте подтверждению оплаты с клиента
- ✅ Доступ к продукту ТОЛЬКО после webhook confirmation
- ❌ Неоплаченные заказы НЕ дают доступ к скачиванию

```typescript
// ✅ Правильно
@Post('stripe/webhook')
async handleStripeWebhook(@Body() event: StripeEvent) {
  if (event.type === 'payment_intent.succeeded') {
    await this.ordersService.markAsPaid(event.data.object.metadata.orderId);
  }
}
```

### 4. Ответственность бэкенда

**Бэкенд ДОЛЖЕН:**
- Авторизация и аутентификация
- Валидация покупок
- Генерация signed URLs
- Логирование активности скачивания

**Бэкенд НЕ ДОЛЖЕН:**
- Стримить большие файлы
- Быть прокси для скачивания файлов
- Передавать storage credentials клиенту

### 5. Ответственность фронтенда

**Frontend ДОЛЖЕН:**
- Запрашивать download URLs через API
- Скачивать файлы напрямую из R2

**Frontend НЕ ДОЛЖЕН:**
- Содержать storage credentials
- Самостоятельно строить download URLs

**Flow:**
```
1. User clicks "Download"
2. Frontend → POST /api/downloads/generate
3. Backend → validates + returns signed URL
4. Browser → downloads directly from R2
```

## 🗄️ Database Schema

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- в центах
  file_key VARCHAR(500) NOT NULL, -- путь в R2, НЕ URL
  preview_image_key VARCHAR(500),
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  status VARCHAR(20) NOT NULL, -- pending, paid, fulfilled
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Order Items
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  price INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Download Logs
```sql
CREATE TABLE download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  ip_address INET,
  user_agent TEXT,
  downloaded_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 JWT Authentication

### Token Structure

**Access Token (15 минут):**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "exp": 1234567890
}
```

**Refresh Token (7 дней):**
```json
{
  "userId": "uuid",
  "exp": 1234567890
}
```

### Required Endpoints

#### `POST /api/auth/register`
```typescript
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

// Response
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "avatar": "https://..."
  }
}
```

#### `POST /api/auth/login`
```typescript
// Request
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

// Response: same as register
```

#### `POST /api/auth/refresh`
```typescript
// Request
{
  "refreshToken": "eyJhbGc..."
}

// Response
{
  "accessToken": "eyJhbGc..."
}
```

## 📦 Products & Downloads

### `GET /api/products`
```typescript
// Response
{
  "data": [
    {
      "id": "uuid",
      "title": "Stylized Room",
      "description": "...",
      "price": 4500, // $45.00
      "previewImage": "https://cdn.mnostva.com/previews/...",
      "category": "room"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

### `GET /api/products/:id`
```typescript
// Response
{
  "id": "uuid",
  "title": "Stylized Room",
  "description": "...",
  "price": 4500,
  "previewImage": "https://...",
  "category": "room",
  "fileSize": 125000000, // bytes
  "format": "zip"
}
```

### `POST /api/downloads/generate`
**Требует авторизации**

```typescript
// Request
{
  "productId": "uuid"
}

// Response
{
  "downloadUrl": "https://r2.mnostva.com/products/...?signature=...",
  "expiresAt": "2024-01-01T12:10:00Z"
}
```

## 💳 Stripe Integration

### `POST /api/checkout/create-payment-intent`
```typescript
// Request
{
  "items": [
    { "productId": "uuid", "quantity": 1 }
  ]
}

// Response
{
  "clientSecret": "pi_xxx_secret_xxx",
  "orderId": "uuid"
}
```

### `POST /api/stripe/webhook`
**Stripe webhook endpoint**

```typescript
@Post('stripe/webhook')
async handleWebhook(@Headers('stripe-signature') signature: string, @Body() body) {
  const event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      await this.ordersService.markAsPaid(event.data.object.metadata.orderId);
      break;
    case 'payment_intent.payment_failed':
      await this.ordersService.markAsFailed(event.data.object.metadata.orderId);
      break;
  }
}
```

## 🔒 Security Best Practices

### 1. HTTPS Only
```typescript
// В production всегда используйте HTTPS
if (process.env.NODE_ENV === 'production' && !req.secure) {
  return res.redirect('https://' + req.headers.host + req.url);
}
```

### 2. CORS Configuration
```typescript
app.enableCors({
  origin: ['https://mnostva.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});
```

### 3. Rate Limiting
```typescript
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 requests per 60 seconds
@Post('auth/login')
async login() { }
```

### 4. Password Hashing
```typescript
import * as bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, user.passwordHash);
```

### 5. Input Validation
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

## 🧪 Testing Requirements

### Coverage Requirements
- **Statements:** ≥80%
- **Branches:** ≥80%
- **Functions:** ≥80%
- **Lines:** ≥80%

### Must Be Tested
```typescript
// ✅ Purchase validation
it('denies download if user has not purchased the product', async () => {
  await expect(
    service.generateDownloadUrl(user.id, product.id)
  ).rejects.toThrow(PurchaseNotFoundError);
});

// ✅ Download authorization
it('generates signed URL for valid purchase', async () => {
  const url = await service.generateDownloadUrl(user.id, product.id);
  expect(url).toContain('signature=');
});

// ✅ Stripe webhooks
it('marks order as paid on payment_intent.succeeded', async () => {
  await controller.handleWebhook(event);
  const order = await ordersRepo.findOne(orderId);
  expect(order.status).toBe('paid');
});
```

## 📝 Code Style

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
generateSignedDownloadUrl()
validatePurchaseOwnership()
handleStripePaymentSucceeded()
```

**Variables:**
```typescript
const isUserAuthorized = true;
const hasActivePurchase = false;
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mnostva

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=mnostva-products
R2_PUBLIC_URL=https://cdn.mnostva.com
```

## 🚀 Deployment

### Production Checklist
- [ ] HTTPS настроен
- [ ] CORS whitelist настроен
- [ ] Rate limiting включён
- [ ] Environment variables настроены
- [ ] Database migrations выполнены
- [ ] Stripe webhooks настроены
- [ ] R2 bucket создан и настроен
- [ ] Мониторинг и логирование настроены
- [ ] Backup БД настроен

---

**Следующие шаги:**
1. Прочитайте `API_REFERENCE.md` для полного списка endpoints
2. Прочитайте `DEPLOYMENT.md` для инструкций по деплою
3. Настройте локальное окружение согласно `.env.example`
