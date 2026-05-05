# API Reference — Mnostva 3D Marketplace

## 🔐 Authentication

Все защищённые endpoints требуют JWT токен в header:
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST /api/auth/register
Регистрация нового пользователя.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `201 Created`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=John"
  }
}
```

**Errors:**
- `400 Bad Request` — Validation error
- `409 Conflict` — Email already exists

---

### POST /api/auth/login
Вход существующего пользователя.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
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

**Errors:**
- `401 Unauthorized` — Invalid credentials
- `400 Bad Request` — Validation error

---

### POST /api/auth/refresh
Обновление access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGc..."
}
```

**Errors:**
- `401 Unauthorized` — Invalid or expired refresh token

---

## Products Endpoints

### GET /api/products
Получить список продуктов с пагинацией и фильтрацией.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `category` (string, optional) — `room`, `level`, `prop`, `full-pack`
- `search` (string, optional)
- `sortBy` (string, optional) — `newest`, `price-asc`, `price-desc`, `popular`

**Request:**
```
GET /api/products?page=1&limit=20&category=room&sortBy=newest
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Stylized Room Pack",
      "description": "High-quality 3D room with stylized aesthetic",
      "price": 4500,
      "previewImage": "https://cdn.mnostva.com/previews/room-pack.jpg",
      "category": "room",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### GET /api/products/:id
Получить детальную информацию о продукте.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Stylized Room Pack",
  "description": "Detailed description...",
  "price": 4500,
  "previewImage": "https://cdn.mnostva.com/previews/room-pack.jpg",
  "category": "room",
  "features": ["Modular walls", "20 Props"],
  "packContent": ["10x Meshes", "5x Textures"],
  "compatibility": ["Unity", "Unreal Engine"],
  "technicalSpecs": {
    "polyCount": "10k",
    "textures": "4K PBR",
    "rigged": false,
    "animated": false
  },
  "externalLinks": {
    "unity": "https://assetstore.unity.com/...",
    "fab": "https://fab.com/..."
  },
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Errors:**
- `404 Not Found` — Product not found

---

## Orders & Checkout

### POST /api/checkout/create-payment-intent
Создать Stripe Payment Intent для оформления заказа.

**Auth Required:** ✅

**Request:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 1
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "orderId": "uuid",
  "amount": 4500
}
```

**Errors:**
- `400 Bad Request` — Invalid product IDs
- `401 Unauthorized` — Not authenticated

---

### GET /api/orders
Получить список заказов текущего пользователя.

**Auth Required:** ✅

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional) — `pending`, `paid`, `fulfilled`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "status": "paid",
      "totalAmount": 4500,
      "items": [
        {
          "id": "uuid",
          "product": {
            "id": "uuid",
            "title": "Stylized Room Pack",
            "previewImage": "https://..."
          },
          "price": 4500
        }
      ],
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET /api/orders/:id
Получить детали конкретного заказа.

**Auth Required:** ✅

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "paid",
  "totalAmount": 4500,
  "stripePaymentIntentId": "pi_xxx",
  "items": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "title": "Stylized Room Pack",
        "previewImage": "https://...",
        "fileSize": 125000000
      },
      "price": 4500
    }
  ],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:05:00Z"
}
```

**Errors:**
- `404 Not Found` — Order not found
- `403 Forbidden` — Order belongs to another user

---

## Downloads

### POST /api/downloads/generate
Сгенерировать signed URL для скачивания продукта.

**Auth Required:** ✅

**Request:**
```json
{
  "productId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "downloadUrl": "https://r2.mnostva.com/products/room-pack.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Signature=...",
  "expiresAt": "2024-01-15T10:10:00Z",
  "fileSize": 125000000,
  "fileName": "stylized-room-pack.zip"
}
```

**Errors:**
- `401 Unauthorized` — Not authenticated
- `403 Forbidden` — User has not purchased this product
- `404 Not Found` — Product not found
- `429 Too Many Requests` — Download limit exceeded

**Notes:**
- Signed URL действителен 10 минут
- Новый URL генерируется при каждом запросе
- URL НЕ сохраняется в БД

---

### GET /api/downloads/history
Получить историю скачиваний пользователя.

**Auth Required:** ✅

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "title": "Stylized Room Pack",
        "previewImage": "https://..."
      },
      "downloadedAt": "2024-01-15T10:05:00Z",
      "ipAddress": "192.168.1.1"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 20
  }
}
```

---

## User Profile

### GET /api/users/me
Получить профиль текущего пользователя.

**Auth Required:** ✅

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "john@example.com",
  "name": "John Doe",
  "avatar": "https://...",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### PATCH /api/users/me
Обновить профиль текущего пользователя.

**Auth Required:** ✅

**Request:**
```json
{
  "name": "John Smith",
  "avatar": "https://new-avatar-url.com/avatar.jpg"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "john@example.com",
  "name": "John Smith",
  "avatar": "https://new-avatar-url.com/avatar.jpg",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Errors:**
- `400 Bad Request` — Validation error

---

## Webhooks

### POST /api/stripe/webhook
Stripe webhook endpoint (только для Stripe).

**Headers:**
```
stripe-signature: t=xxx,v1=xxx
```

**Events Handled:**
- `payment_intent.succeeded` — Заказ помечается как `paid`
- `payment_intent.payment_failed` — Заказ помечается как `failed`

**Response:** `200 OK`

**Errors:**
- `400 Bad Request` — Invalid signature
- `500 Internal Server Error` — Processing error

---

## Error Response Format

Все ошибки возвращаются в едином формате:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

---

## Rate Limiting

**Auth endpoints:**
- 5 requests per minute per IP

**Download generation:**
- 10 requests per minute per user

**General API:**
- 100 requests per minute per user

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

**Error Response:** `429 Too Many Requests`
```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "error": "Too Many Requests"
}
```

---

## Pagination

Все endpoints с пагинацией возвращают:

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## Testing

### Example: cURL

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Get Products (with auth):**
```bash
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer <access_token>"
```

**Generate Download URL:**
```bash
curl -X POST http://localhost:3001/api/downloads/generate \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid"
  }'
```

---

**См. также:**
- `BACKEND_ARCHITECTURE.md` — Архитектура и правила
- `DEPLOYMENT.md` — Инструкции по деплою
