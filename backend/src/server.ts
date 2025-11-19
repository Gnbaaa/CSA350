import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { createDatabase, closeDatabase } from './infra/database';
import {
  createSqliteUserRepository,
  createSqliteLoginHistoryRepository
} from './infra/sqlite-user-repository';
import { createInMemoryUserRepository } from './infra/in-memory-user-repository';
import { createAuthRouterWithHistory } from './routes/auth-router-with-history';
import { createAuthRouter } from './routes/auth-router';
import { createAdminRouter } from './routes/admin-router';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import bcrypt from 'bcryptjs';
import { AdminRouterConfig } from './routes/admin-router';
import { AuthRouterConfig } from './routes/auth-router';
import { UserRepository } from './domain/user';

/**
 * SQLite database ашиглах server (хэрэглэгчид хадгална)
 * Тестүүдэд in-memory repository ашиглах боломжтой
 */
export function createServer(testConfig?: { userRepository?: UserRepository; jwtSecret?: string }) {
  // Test mode бол in-memory, эсвэл SQLite ашиглах
  const isTestMode = !!testConfig?.userRepository;
  let db: ReturnType<typeof createDatabase> | null = null;
  let userRepository: UserRepository;
  let loginHistoryRepository: ReturnType<typeof createSqliteLoginHistoryRepository> | null = null;
  const jwtSecret = testConfig?.jwtSecret ?? process.env.JWT_SECRET ?? 'dev-secret';

  if (isTestMode) {
    // Test mode: in-memory repository ашиглах
    userRepository = testConfig.userRepository!;
  } else {
    // Production mode: SQLite database ашиглах
    db = createDatabase();
    userRepository = createSqliteUserRepository(db);
    loginHistoryRepository = createSqliteLoginHistoryRepository(db);
  }

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
    res.json({ status: 'ok', database: isTestMode ? 'in-memory' : 'sqlite' });
  });

  // Auth routes
  if (isTestMode || !loginHistoryRepository) {
    // Test mode: login history байхгүй router ашиглах
    const authConfig: AuthRouterConfig = {
      userRepository,
      jwtSecret
    };
    app.use('/api/auth', createAuthRouter(authConfig));
  } else {
    // Production mode: login history-тай router ашиглах
    app.use(
      '/api/auth',
      createAuthRouterWithHistory({
        userRepository,
        loginHistoryRepository,
        jwtSecret
      })
    );
  }

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

  // Graceful shutdown (зөвхөн production mode)
  if (db && !isTestMode) {
    process.on('SIGINT', () => {
      closeDatabase(db!);
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      closeDatabase(db!);
      process.exit(0);
    });
  }

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 3333);
  const app = createServer();
  app.listen(port, () => {
    console.log(`🚀 Auth service with SQLite listening on http://localhost:${port}`);
    console.log(`📁 Database: data/app.db`);
    console.log(`✅ Users are being saved to database`);
  });
}

