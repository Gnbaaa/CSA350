import { Router, Request, Response } from 'express';
import { UserRepository } from '../domain/user';
import { createInMemoryUserRepository } from '../infra/in-memory-user-repository';
import { createAuthServiceV2 } from '../services/auth-service-v2';
import { asyncHandler } from '../middleware/error-handler';

export interface AuthRouterConfig {
  userRepository: UserRepository;
  jwtSecret: string;
}

function resolveConfig(overrides: Partial<AuthRouterConfig> = {}): AuthRouterConfig {
  return {
    userRepository: overrides.userRepository ?? createInMemoryUserRepository(),
    jwtSecret: overrides.jwtSecret ?? process.env.JWT_SECRET ?? 'dev-secret'
  };
}

/**
 * Exception-based auth router
 * Алдаа гарвал exception шидэж, error handler middleware боловсруулна
 */
export function createAuthRouterV2(overrides?: Partial<AuthRouterConfig>): Router {
  const config = resolveConfig(overrides);
  const authService = createAuthServiceV2({
    userRepository: config.userRepository,
    jwtSecret: config.jwtSecret
  });

  const router = Router();

  router.post(
    '/signup',
    asyncHandler(async (req: Request, res: Response) => {
      const user = await authService.register(req.body);
      return res.status(201).json({
        message: 'Бүртгэл амжилттай үүслээ',
        user
      });
    })
  );

  router.post(
    '/login',
    asyncHandler(async (req: Request, res: Response) => {
      const { token, user } = await authService.authenticate(req.body);
      return res.status(200).json({
        message: 'Амжилттай нэвтэрлээ',
        token,
        user
      });
    })
  );

  return router;
}

