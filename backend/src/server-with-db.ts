import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { createDatabase, closeDatabase } from './infra/database';
import {
  createSqliteUserRepository,
  createSqliteLoginHistoryRepository
} from './infra/sqlite-user-repository';
import { createAuthRouterWithHistory } from './routes/auth-router-with-history';
import { createAdminRouter } from './routes/admin-router';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import bcrypt from 'bcryptjs';
import { AdminRouterConfig } from './routes/admin-router';

/**
 * SQLite database ашиглах server
 */
export function createServerWithDatabase(dbPath?: string) {
  // Database үүсгэх
  const db = createDatabase(dbPath);
  const userRepository = createSqliteUserRepository(db);
  const loginHistoryRepository = createSqliteLoginHistoryRepository(db);
  const jwtSecret = process.env.JWT_SECRET ?? 'dev-secret';

  // Admin account үүсгэх
  async function seedAdminAccount() {
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

  void seedAdminAccount();

  const app = express();

  // Trust proxy for IP address
  app.set('trust proxy', true);

  app.use(helmet());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_, res) => {
    res.json({ status: 'ok', database: 'sqlite' });
  });

  // Auth routes with login history
  app.use(
    '/api/auth',
    createAuthRouterWithHistory({
      userRepository,
      loginHistoryRepository,
      jwtSecret
    })
  );

  // Admin routes
  const adminConfig: AdminRouterConfig = {
    userRepository,
    jwtSecret
  };
  app.use('/api/admin', createAdminRouter(adminConfig));

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  // Graceful shutdown
  process.on('SIGINT', () => {
    closeDatabase(db);
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    closeDatabase(db);
    process.exit(0);
  });

  return { app, db, userRepository, loginHistoryRepository };
}

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 3333);
  const { app } = createServerWithDatabase();
  app.listen(port, () => {
    console.log(`🚀 Auth service with SQLite listening on http://localhost:${port}`);
    console.log(`📁 Database: data/app.db`);
  });
}

