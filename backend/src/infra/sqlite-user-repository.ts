import { randomUUID } from 'node:crypto';
import Database from 'better-sqlite3';
import { User, UserRepository } from '../domain/user';

export interface LoginHistoryEntry {
  id: string;
  userId: string | null;
  email: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  attemptedAt: Date;
}

export interface LoginHistoryRepository {
  create(entry: Omit<LoginHistoryEntry, 'id'>): Promise<LoginHistoryEntry>;
  findByUserId(userId: string, limit?: number): Promise<LoginHistoryEntry[]>;
  findByEmail(email: string, limit?: number): Promise<LoginHistoryEntry[]>;
}

/**
 * SQLite User Repository
 */
export function createSqliteUserRepository(db: Database.Database): UserRepository {
  async function findByEmail(email: string): Promise<User | null> {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email.toLowerCase()) as
      | {
          id: string;
          email: string;
          full_name: string;
          password_hash: string;
          role: string;
          created_at: string;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      passwordHash: row.password_hash,
      createdAt: new Date(row.created_at),
      role: row.role as 'admin' | 'ngo' | 'citizen'
    };
  }

  async function create(user: Omit<User, 'id'>): Promise<User> {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, full_name, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      user.email.toLowerCase(),
      user.fullName,
      user.passwordHash,
      user.role,
      user.createdAt.toISOString()
    );

    return {
      id,
      ...user
    };
  }

  return { findByEmail, create };
}

/**
 * SQLite Login History Repository
 */
export function createSqliteLoginHistoryRepository(
  db: Database.Database
): LoginHistoryRepository {
  async function create(entry: Omit<LoginHistoryEntry, 'id'>): Promise<LoginHistoryEntry> {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO login_history (id, user_id, email, success, ip_address, user_agent, attempted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      entry.userId,
      entry.email.toLowerCase(),
      entry.success ? 1 : 0,
      entry.ipAddress || null,
      entry.userAgent || null,
      entry.attemptedAt.toISOString()
    );

    return {
      id,
      ...entry
    };
  }

  async function findByUserId(userId: string, limit = 10): Promise<LoginHistoryEntry[]> {
    const stmt = db.prepare(`
      SELECT * FROM login_history
      WHERE user_id = ?
      ORDER BY attempted_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(userId, limit) as Array<{
      id: string;
      user_id: string;
      email: string;
      success: number;
      ip_address: string | null;
      user_agent: string | null;
      attempted_at: string;
    }>;

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id || null,
      email: row.email,
      success: row.success === 1,
      ipAddress: row.ip_address || undefined,
      userAgent: row.user_agent || undefined,
      attemptedAt: new Date(row.attempted_at)
    }));
  }

  async function findByEmail(email: string, limit = 10): Promise<LoginHistoryEntry[]> {
    const stmt = db.prepare(`
      SELECT * FROM login_history
      WHERE email = ?
      ORDER BY attempted_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(email.toLowerCase(), limit) as Array<{
      id: string;
      user_id: string;
      email: string;
      success: number;
      ip_address: string | null;
      user_agent: string | null;
      attempted_at: string;
    }>;

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id || null,
      email: row.email,
      success: row.success === 1,
      ipAddress: row.ip_address || undefined,
      userAgent: row.user_agent || undefined,
      attemptedAt: new Date(row.attempted_at)
    }));
  }

  return { create, findByUserId, findByEmail };
}

