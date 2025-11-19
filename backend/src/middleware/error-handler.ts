import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { logger } from '../utils/logger';

/**
 * Express алдаа боловсруулагч middleware
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  // AppError бол алдааны мэдээллийг ашиглах
  if (error instanceof AppError) {
    logger.error('Application error', error, {
      path: req.path,
      method: req.method,
      statusCode: error.statusCode
    });

    return res.status(error.statusCode).json(error.toJSON());
  }

  // Zod validation алдаа
  if (error.name === 'ZodError' && 'issues' in error) {
    logger.warn('Validation error', { path: req.path, method: req.method });
    return res.status(400).json({
      error: 'Баталгаажуулалтын алдаа',
      statusCode: 400,
      details: { issues: (error as { issues: unknown[] }).issues }
    });
  }

  // JWT алдаа
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    logger.warn('JWT error', { path: req.path, method: req.method });
    return res.status(401).json({
      error: 'Токен буруу эсвэл хугацаа дууссан',
      statusCode: 401
    });
  }

  // Бусад алдаанууд
  logger.error('Unexpected error', error, {
    path: req.path,
    method: req.method,
    body: req.body
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  return res.status(500).json({
    error: 'Дотоод серверийн алдаа',
    statusCode: 500,
    ...(isDevelopment && { message: error.message, stack: error.stack })
  });
}

/**
 * 404 алдаа боловсруулагч
 */
export function notFoundHandler(req: Request, res: Response) {
  logger.warn('Route not found', { path: req.path, method: req.method });
  res.status(404).json({
    error: 'API endpoint олдсонгүй',
    statusCode: 404,
    path: req.path
  });
}

/**
 * Async алдаа барьж авах wrapper
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

