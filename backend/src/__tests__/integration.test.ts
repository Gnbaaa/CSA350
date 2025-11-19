import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import { createServerWithDatabase } from '../server-with-db';
import { closeDatabase } from '../infra/database';
import Database from 'better-sqlite3';
import { join } from 'path';
import { unlinkSync, existsSync } from 'fs';

describe('Integration Tests', () => {
  const testDbPath = join(__dirname, '../../test-integration.db');
  let app: Express;
  let db: Database.Database;

  beforeAll(() => {
    // Remove test database if exists
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }

    const server = createServerWithDatabase(testDbPath);
    app = server.app;
    db = server.db;
  });

  afterAll(() => {
    closeDatabase(db);
    // Clean up test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  describe('User Registration and Login Flow', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Test123456',
          fullName: 'Test User'
        })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Account created');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('fullName', 'Test User');
      expect(response.body.user).toHaveProperty('role', 'citizen');
    });

    it('should reject duplicate email registration', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Test123456',
          fullName: 'Another User'
        })
        .expect(409);
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123456'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Authenticated');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123456'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('Login History', () => {
    let authToken: string;

    beforeAll(async () => {
      // Login to get token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123456'
        });

      authToken = response.body.token;
    });

    it('should track successful login in history', async () => {
      const response = await request(app)
        .get('/api/auth/login-history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
      expect(response.body.history.length).toBeGreaterThan(0);

      const latestEntry = response.body.history[0];
      expect(latestEntry).toHaveProperty('email', 'test@example.com');
      expect(latestEntry).toHaveProperty('success', true);
      expect(latestEntry).toHaveProperty('attemptedAt');
    });

    it('should track failed login attempts', async () => {
      // Make a failed login attempt
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        })
        .expect(401);

      // Check history includes failed attempt
      const response = await request(app)
        .get('/api/auth/login-history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const failedEntry = response.body.history.find(
        (entry: { success: boolean }) => entry.success === false
      );
      expect(failedEntry).toBeDefined();
      expect(failedEntry.success).toBe(false);
    });

    it('should require authentication to view login history', async () => {
      await request(app)
        .get('/api/auth/login-history')
        .expect(401);
    });

    it('should limit login history results', async () => {
      // Make multiple login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'Test123456'
          });
      }

      const response = await request(app)
        .get('/api/auth/login-history?limit=3')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.history.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Logout', () => {
    it('should handle logout request', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });

  describe('Database Persistence', () => {
    it('should persist user data across server restarts', async () => {
      // Create a new user
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'persistent@example.com',
          password: 'Test123456',
          fullName: 'Persistent User'
        })
        .expect(201);

      // Close and reopen database
      closeDatabase(db);
      const newServer = createServerWithDatabase(testDbPath);
      const newApp = newServer.app;

      // Try to login with the same credentials
      const response = await request(newApp)
        .post('/api/auth/login')
        .send({
          email: 'persistent@example.com',
          password: 'Test123456'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('persistent@example.com');

      // Clean up
      closeDatabase(newServer.db);
    });
  });
});

