import { Router } from 'express';
import { UserRepository } from '../domain/user';
import { createInMemoryUserRepository } from '../infra/in-memory-user-repository';
import { createAuthService } from '../services/auth-service';

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

export function createAuthRouter(overrides?: Partial<AuthRouterConfig>): Router {
  const config = resolveConfig(overrides);
  const authService = createAuthService({
    userRepository: config.userRepository,
    jwtSecret: config.jwtSecret
  });

  const router = Router();

  router.post('/signup', async (req, res) => {
    const result = await authService.register(req.body);

    if (!result.ok) {
      if (result.reason === 'validation') {
        return res.status(400).json({ error: 'Invalid signup data', details: result.issues });
      }

      if (result.reason === 'conflict') {
        return res.status(409).json({ error: 'Email already in use' });
      }

      return res.status(500).json({ error: 'Unable to sign up' });
    }

    return res.status(201).json({ message: 'Account created', user: result.user });
  });

  router.post('/login', async (req, res) => {
    const result = await authService.authenticate(req.body);

    if (!result.ok) {
      if (result.reason === 'validation') {
        return res.status(400).json({ error: 'Invalid login data', details: result.issues });
      }

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({
      message: 'Authenticated',
      token: result.token,
      user: result.user
    });
  });

  return router;
}

