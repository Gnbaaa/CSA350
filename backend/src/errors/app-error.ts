/**
 * Үндсэн аппликейшн алдааны класс
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      statusCode: this.statusCode,
      ...(this.details && { details: this.details })
    };
  }
}

/**
 * Баталгаажуулалтын алдаа
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Баталгаажуулалтын алдаа', details?: Record<string, unknown>) {
    super(message, 400, details);
  }
}

/**
 * Олдсонгүй алдаа
 */
export class NotFoundError extends AppError {
  constructor(resourceName: string, resourceId?: string | number) {
    const message = resourceId
      ? `${resourceName} олдсонгүй: ${resourceId}`
      : `${resourceName} олдсонгүй`;
    super(message, 404);
  }
}

/**
 * Өгөгдлийн сангийн алдаа
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Өгөгдлийн сангийн алдаа', details?: Record<string, unknown>) {
    super(message, 500, details);
  }
}

/**
 * Нэвтрэх эрхгүй алдаа
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Нэвтрэх эрхгүй') {
    super(message, 401);
  }
}

/**
 * Хандах эрхгүй алдаа
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Хандах эрхгүй') {
    super(message, 403);
  }
}

/**
 * Зөрчил алдаа (конфликт)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Зөрчил гарлаа', details?: Record<string, unknown>) {
    super(message, 409, details);
  }
}

