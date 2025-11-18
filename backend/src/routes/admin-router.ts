import type { Request, Response, NextFunction, Router } from 'express';
import { Router as createRouter } from 'express';
import jwt from 'jsonwebtoken';
import { createAuthService } from '../services/auth-service';
import { UserRepository, UserRole } from '../domain/user';

interface TokenPayload {
  sub: string;
  role: UserRole;
}

export interface AdminRouterConfig {
  jwtSecret: string;
  userRepository: UserRepository;
}

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

function createRequireRoleMiddleware(jwtSecret: string, role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing bearer token' });
    }

    const token = header.slice('Bearer '.length);

    try {
      const payload = jwt.verify(token, jwtSecret) as TokenPayload;

      if (payload.role !== role) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      (req as AuthenticatedRequest).user = payload;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

export function createAdminRouter(config: AdminRouterConfig): Router {
  const authService = createAuthService({ userRepository: config.userRepository, jwtSecret: config.jwtSecret });
  const requireAdmin = createRequireRoleMiddleware(config.jwtSecret, 'admin');

  const router = createRouter();

  router.post('/ngos', requireAdmin, async (req: AuthenticatedRequest, res) => {
    const result = await authService.registerNgo(req.body);

    if (!result.ok) {
      if (result.reason === 'validation') {
        return res.status(400).json({ error: 'Invalid NGO data', details: result.issues });
      }

      if (result.reason === 'conflict') {
        return res.status(409).json({ error: 'Email already in use' });
      }

      return res.status(500).json({ error: 'Unable to register NGO' });
    }

    return res.status(201).json({ message: 'NGO account created', user: result.user });
  });

  return router;
}

