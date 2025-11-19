import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { AuthRouterConfig, createAuthRouter } from './routes/auth-router';
import { createAdminRouter } from './routes/admin-router';
import { createInMemoryUserRepository } from './infra/in-memory-user-repository';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import bcrypt from 'bcryptjs';

async function seedAdminAccount(config: Required<AuthRouterConfig>) {
  const { userRepository } = config;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME ?? 'System Administrator';

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existing = await userRepository.findByEmail(adminEmail);
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await userRepository.create({
    email: adminEmail,
    fullName: adminName,
    passwordHash,
    createdAt: new Date(),
    role: 'admin'
  });
}

export function createServer(authConfig?: Partial<AuthRouterConfig>) {
  const userRepository = authConfig?.userRepository ?? createInMemoryUserRepository();
  const jwtSecret = authConfig?.jwtSecret ?? process.env.JWT_SECRET ?? 'dev-secret';

  const sharedConfig: Required<AuthRouterConfig> = {
    userRepository,
    jwtSecret
  };

  void seedAdminAccount(sharedConfig);

  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', createAuthRouter(sharedConfig));
  app.use('/api/admin', createAdminRouter(sharedConfig));

  // 404 handler (бүх route-уудын дараа)
  app.use(notFoundHandler);

  // Error handler (бүх middleware-уудын дараа)
  app.use(errorHandler);

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 3333);
  const app = createServer();
  app.listen(port, () => {
    console.log(`🚀 Auth service listening on http://localhost:${port}`);
  });
}

