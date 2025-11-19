import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Database-ийг эхлүүлэх
 */
export function createDatabase(dbPath?: string): Database.Database {
  const databasePath = dbPath || join(process.cwd(), 'data', 'app.db');
  const dataDir = join(process.cwd(), 'data');

  // Data хавтас үүсгэх
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(databasePath);

  // Foreign keys идэвхжүүлэх
  db.pragma('foreign_keys = ON');

  // Schema үүсгэх
  initializeSchema(db);

  return db;
}

/**
 * Database schema үүсгэх
 */
function initializeSchema(db: Database.Database) {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'ngo', 'citizen')),
      created_at TEXT NOT NULL
    )
  `);

  // Login history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS login_history (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      email TEXT NOT NULL,
      success INTEGER NOT NULL CHECK(success IN (0, 1)),
      ip_address TEXT,
      user_agent TEXT,
      attempted_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Indexes үүсгэх
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_login_history_attempted_at ON login_history(attempted_at);
  `);
}

/**
 * Database-ийг хаах
 */
export function closeDatabase(db: Database.Database) {
  db.close();
}

