# Лаборатори 9: Гадаад сангуудтай ажиллах ба алдааны мэдээлэл

## Хийгдсэн ажлууд

### 1. Custom Error Classes үүсгэсэн

**Файл:** `backend/src/errors/app-error.ts`

- `AppError` - Үндсэн алдааны класс
- `ValidationError` - Баталгаажуулалтын алдаа (400)
- `NotFoundError` - Олдсонгүй алдаа (404)
- `UnauthorizedError` - Нэвтрэх эрхгүй (401)
- `ForbiddenError` - Хандах эрхгүй (403)
- `ConflictError` - Зөрчил алдаа (409)
- `DatabaseError` - Өгөгдлийн сангийн алдаа (500)

### 2. Error Handler Middleware үүсгэсэн

**Файл:** `backend/src/middleware/error-handler.ts`

- `errorHandler` - Express алдаа боловсруулагч middleware
- `notFoundHandler` - 404 алдаа боловсруулагч
- `asyncHandler` - Async функц доторх алдааг барьж авах wrapper

**Онцлог:**
- AppError-уудыг зөв статус кодтой JSON response болгон хувиргана
- Zod validation алдаануудыг боловсруулна
- JWT алдаануудыг боловсруулна
- Development орчинд дэлгэрэнгүй алдааны мэдээлэл харуулна

### 3. Logging System үүсгэсэн

**Файл:** `backend/src/utils/logger.ts`

**Онцлог:**
- Консолд алдааны мэдээлэл хэвлэнэ
- `logs/` хавтсанд өдөр бүрийн лог файл үүсгэнэ
- Log levels: info, error, warn, debug

**Лог файлууд:**
- `logs/app_YYYY-MM-DD_info.log`
- `logs/app_YYYY-MM-DD_error.log`
- `logs/app_YYYY-MM-DD_warn.log`
- `logs/app_YYYY-MM-DD_debug.log`

### 4. Exception-based Auth Service үүсгэсэн

**Файл:** `backend/src/services/auth-service-v2.ts`

**Онцлог:**
- Алдаа гарвал exception шиднэ (result object биш)
- Бүх алдаануудыг лог хийж байна
- Дэлгэрэнгүй алдааны мэдээлэл өгдөг

**Жишээ:**
```typescript
// Validation алдаа
throw new ValidationError('Бүртгэлийн мэдээлэл буруу байна', { issues });

// Conflict алдаа
throw new ConflictError('Энэ имэйл хаяг аль хэдийн бүртгэлтэй байна', { email });

// Unauthorized алдаа
throw new UnauthorizedError('Имэйл эсвэл нууц үг буруу байна');
```

### 5. Frontend Error Handling сайжруулсан

**Файл:** `frontend/src/utils/error-handler.ts`

**Функцүүд:**
- `getErrorMessage()` - API алдааны мэдээллийг хэрэглэгчдэд ойлгомжтой текст болгон хувиргана
- `handleApiError()` - API response-оос алдааны мэдээлэл гаргах
- `getFieldErrors()` - Field-level алдааны мэдээллийг гаргах

**Онцлог:**
- Монгол хэл дээрх алдааны мэдээлэл
- Field-level алдаануудыг тусгайлан харуулна
- Validation алдаануудыг дэлгэрэнгүй харуулна

### 6. Frontend Components шинэчлэсэн

**Файлууд:**
- `frontend/src/components/login-form.tsx`
- `frontend/src/components/signup-form.tsx`

**Онцлог:**
- Шинэ error handler ашиглаж байна
- Field-level алдаануудыг харуулна
- Ойлгомжтой алдааны мэдээлэл харуулна

## Ашиглах заавар

### Backend дээр алдаа шидэх

```typescript
import { ValidationError, ConflictError } from '../errors/app-error';

async function createUser(data: unknown) {
  if (!data.email) {
    throw new ValidationError('Имэйл шаардлагатай');
  }

  const existing = await userRepository.findByEmail(data.email);
  if (existing) {
    throw new ConflictError('Имэйл аль хэдийн бүртгэлтэй');
  }
  
  // ...
}
```

### Route дээр asyncHandler ашиглах

```typescript
import { asyncHandler } from '../middleware/error-handler';

router.post(
  '/users',
  asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);
    return res.status(201).json({ user });
  })
);
```

### Frontend дээр алдаа боловсруулах

```typescript
import { getErrorMessage, handleApiError } from '../utils/error-handler';

const response = await fetch('/api/auth/login', { ... });

if (!response.ok) {
  const apiError = await handleApiError(response);
  const errorMessage = getErrorMessage(apiError);
  setError(errorMessage);
}
```

## Гадаад пакетууд

### Backend
- `bcryptjs` - Нууц үг hash хийх
- `jsonwebtoken` - JWT токен үүсгэх
- `zod` - Validation
- `express` - Web framework
- `helmet` - Security middleware
- `morgan` - HTTP request logger

### Frontend
- `react` - UI framework
- `zod` - Validation
- `axios` - HTTP client (optional)

## Дүгнэлт

Энэ лабораторид бид:
1. ✅ Custom error classes үүсгэсэн
2. ✅ Error handler middleware хэрэгжүүлсэн
3. ✅ Logging system нэвтрүүлсэн
4. ✅ Exception-based service үүсгэсэн
5. ✅ Frontend error handling сайжруулсан
6. ✅ Хэрэглэгчдэд ойлгомжтой алдааны мэдээлэл харуулж байна

Алдааны зөв боловсруулалт нь аппликейшний найдвартай байдал, хэрэглэгчийн туршлагыг сайжруулахад чухал үүрэг гүйцэтгэдэг.

