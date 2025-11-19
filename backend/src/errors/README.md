# Алдааны Мэдээллийн Систем

Энэхүү систем нь аппликейшний алдаануудыг зохих ёсоор боловсруулах, лог хийх, хэрэглэгчдэд ойлгомжтой мэдээлэл харуулахад зориулагдсан.

## Custom Error Classes

### AppError (Үндсэн класс)
Бүх custom алдааны үндсэн класс.

```typescript
throw new AppError('Алдааны мэдээлэл', 500, { details: 'Дэлгэрэнгүй' });
```

### ValidationError (Баталгаажуулалтын алдаа)
HTTP 400 статус кодтой алдаа.

```typescript
throw new ValidationError('Баталгаажуулалтын алдаа', { issues: [...] });
```

### NotFoundError (Олдсонгүй)
HTTP 404 статус кодтой алдаа.

```typescript
throw new NotFoundError('Хэрэглэгч', userId);
```

### UnauthorizedError (Нэвтрэх эрхгүй)
HTTP 401 статус кодтой алдаа.

```typescript
throw new UnauthorizedError('Нэвтрэх эрхгүй');
```

### ForbiddenError (Хандах эрхгүй)
HTTP 403 статус кодтой алдаа.

```typescript
throw new ForbiddenError('Хандах эрхгүй');
```

### ConflictError (Зөрчил)
HTTP 409 статус кодтой алдаа.

```typescript
throw new ConflictError('Имэйл аль хэдийн бүртгэлтэй', { email });
```

### DatabaseError (Өгөгдлийн сангийн алдаа)
HTTP 500 статус кодтой алдаа.

```typescript
throw new DatabaseError('Өгөгдлийн сангийн алдаа');
```

## Ашиглах жишээ

### Service дээр

```typescript
import { ValidationError, ConflictError } from '../errors/app-error';

async function createUser(data: unknown) {
  // Validation
  if (!data.email) {
    throw new ValidationError('Имэйл шаардлагатай');
  }

  // Check conflict
  const existing = await userRepository.findByEmail(data.email);
  if (existing) {
    throw new ConflictError('Имэйл аль хэдийн бүртгэлтэй');
  }

  // Create user...
}
```

### Route дээр

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

## Error Handler Middleware

`error-handler.ts` файл нь:
- AppError-уудыг зөв статус кодтой JSON response болгон хувиргана
- Zod validation алдаануудыг боловсруулна
- JWT алдаануудыг боловсруулna
- Бусад алдаануудыг лог хийж, хэрэглэгчдэд ойлгомжтой мэдээлэл харуулна

## Logging

`logger.ts` утилит нь:
- Консолд алдааны мэдээлэл хэвлэнэ
- `logs/` хавтсанд өдөр бүрийн лог файл үүсгэнэ
- Development орчинд debug мэдээлэл харуулна

Лог файлууд:
- `logs/app_YYYY-MM-DD_info.log` - Ерөнхий мэдээлэл
- `logs/app_YYYY-MM-DD_error.log` - Алдаанууд
- `logs/app_YYYY-MM-DD_warn.log` - Анхааруулгууд

