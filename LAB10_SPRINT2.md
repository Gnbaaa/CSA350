# Лаборатори 10: Хоёрдогч Sprint - Дэвшилтэт функцууд

## Хийгдсэн ажлууд

### 1. SQLite Database Integration

**Файлууд:**
- `backend/src/infra/database.ts` - Database үүсгэх, schema тохируулах
- `backend/src/infra/sqlite-user-repository.ts` - SQLite User болон Login History repository

**Онцлог:**
- SQLite database ашиглах
- Users болон login_history table-ууд
- Foreign keys болон indexes
- Database migrations

**Schema:**
```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'ngo', 'citizen')),
  created_at TEXT NOT NULL
);

-- Login history table
CREATE TABLE login_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  success INTEGER NOT NULL CHECK(success IN (0, 1)),
  ip_address TEXT,
  user_agent TEXT,
  attempted_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2. Login History Tracking

**Файл:** `backend/src/services/auth-service-with-history.ts`

**Онцлог:**
- Бүх нэвтрэх оролдлогуудыг хадгална (амжилттай болон амжилтгүй)
- IP address болон User-Agent мэдээлэл хадгална
- Timestamp бүртгэнэ

**API Endpoints:**
- `POST /api/auth/login` - Нэвтрэх (түүх хадгална)
- `GET /api/auth/login-history` - Нэвтрэх түүх харах (JWT token шаардлагатай)
- `POST /api/auth/logout` - Гарах

### 3. Logout Functionality

**Файл:** `backend/src/routes/auth-router-with-history.ts`

**Онцлог:**
- Logout endpoint нэмсэн
- Client-side token removal (server-side token blacklist хийх боломжтой)

### 4. Integration Tests

**Файл:** `backend/src/__tests__/integration.test.ts`

**Тестүүд:**
- User registration flow
- Login flow (амжилттай болон амжилтгүй)
- Login history tracking
- Database persistence
- Authentication requirements

### 5. Server with Database

**Файл:** `backend/src/server-with-db.ts`

**Онцлог:**
- SQLite database ашиглах
- Login history tracking
- Graceful shutdown
- Database file: `data/app.db`

## Ашиглах заавар

### Database-ийг эхлүүлэх

```bash
cd backend
npm run dev
```

Database автоматаар `data/app.db` файлд үүснэ.

### API Endpoints

#### 1. User Registration
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "Test User"
}
```

#### 2. Login (with history tracking)
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response:
{
  "message": "Authenticated",
  "token": "jwt-token-here",
  "user": { ... }
}
```

#### 3. View Login History
```bash
GET /api/auth/login-history
Authorization: Bearer <jwt-token>
Query params: ?limit=10 (optional)

Response:
{
  "history": [
    {
      "id": "...",
      "email": "user@example.com",
      "success": true,
      "ipAddress": "127.0.0.1",
      "userAgent": "Mozilla/5.0...",
      "attemptedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 4. Logout
```bash
POST /api/auth/logout

Response:
{
  "message": "Logged out successfully"
}
```

### Integration Tests ажиллуулах

```bash
cd backend
npm test -- integration.test.ts
```

## Database Structure

### Users Table
- `id` - UUID
- `email` - Unique email address
- `full_name` - User's full name
- `password_hash` - Bcrypt hashed password
- `role` - 'admin', 'ngo', or 'citizen'
- `created_at` - ISO timestamp

### Login History Table
- `id` - UUID
- `user_id` - Foreign key to users.id
- `email` - Email used for login attempt
- `success` - 0 (failed) or 1 (success)
- `ip_address` - Client IP address
- `user_agent` - Browser/client user agent
- `attempted_at` - ISO timestamp

## Дүгнэлт

Энэ лабораторид бид:
1. ✅ SQLite database интеграц хийсэн
2. ✅ Login history tracking нэвтрүүлсэн
3. ✅ Logout endpoint нэмсэн
4. ✅ Integration tests бичсэн
5. ✅ Database persistence баталгаажуулсан

Бүх системийн бүрэлдэхүүн хэсгүүд хамтдаа зөв ажиллаж байгааг integration тестүүд баталгаажуулж байна.

