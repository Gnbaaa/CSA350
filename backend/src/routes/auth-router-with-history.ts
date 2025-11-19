import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../domain/user';
import { LoginHistoryRepository } from '../infra/sqlite-user-repository';
import { createAuthService } from '../services/auth-service';
import { createAuthServiceWithHistory } from '../services/auth-service-with-history';

export interface AuthRouterWithHistoryConfig {
  userRepository: UserRepository;
  loginHistoryRepository: LoginHistoryRepository;
  jwtSecret: string;
}

/**
 * Auth router with login history and logout
 */
export function createAuthRouterWithHistory(
  config: AuthRouterWithHistoryConfig
): Router {
  const authService = createAuthService({
    userRepository: config.userRepository,
    jwtSecret: config.jwtSecret
  });

  const authServiceWithHistory = createAuthServiceWithHistory({
    userRepository: config.userRepository,
    loginHistoryRepository: config.loginHistoryRepository,
    jwtSecret: config.jwtSecret
  });

  const router = Router();

  // Signup
  router.post('/signup', async (req, res) => {
    const result = await authService.register(req.body);

    if (!result.ok) {
      if (result.reason === 'validation') {
        return res.status(400).json({
          error: 'Invalid signup data',
          details: result.issues
        });
      }

      if (result.reason === 'conflict') {
        return res.status(409).json({ error: 'Email already in use' });
      }

      return res.status(500).json({ error: 'Unable to sign up' });
    }

    return res.status(201).json({
      message: 'Account created',
      user: result.user
    });
  });

  // Login with history tracking
  router.post('/login', async (req, res) => {
    const ipAddress = req.ip || req.socket.remoteAddress || undefined;
    const userAgent = req.get('user-agent') || undefined;

    const result = await authServiceWithHistory.authenticate(
      req.body,
      ipAddress,
      userAgent
    );

    if (!result.ok) {
      if (result.reason === 'validation') {
        return res.status(400).json({
          error: 'Invalid login data',
          details: result.issues
        });
      }

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({
      message: 'Authenticated',
      token: result.token,
      user: result.user
    });
  });

  // Logout (client-side token removal, but we log it)
  router.post('/logout', async (req, res) => {
    // In a real app, you might want to blacklist the token
    // For now, we just return success
    return res.status(200).json({
      message: 'Logged out successfully'
    });
  });

  // Get login history (requires authentication)
  router.get('/login-history', async (req, res) => {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing bearer token' });
    }

    const token = authHeader.slice('Bearer '.length);
    let userId: string;

    try {
      const payload = jwt.verify(token, config.jwtSecret) as { sub: string };
      userId = payload.sub;
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get login history
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;

    const history = await config.loginHistoryRepository.findByUserId(
      userId,
      limit
    );

    return res.status(200).json({
      history: history.map((entry) => ({
        id: entry.id,
        email: entry.email,
        success: entry.success,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        attemptedAt: entry.attemptedAt.toISOString()
      }))
    });
  });

  return router;
}

