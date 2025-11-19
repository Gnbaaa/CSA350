import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserRepository } from '../domain/user';
import {
  LoginHistoryRepository,
  LoginHistoryEntry
} from '../infra/sqlite-user-repository';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

interface SanitizedUser {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
  role: 'admin' | 'ngo' | 'citizen';
}

function sanitizeUser(user: SanitizedUser) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    createdAt: user.createdAt,
    role: user.role
  };
}

export interface AuthServiceWithHistoryConfig {
  userRepository: UserRepository;
  loginHistoryRepository: LoginHistoryRepository;
  jwtSecret: string;
}

/**
 * Auth service with login history tracking
 */
export function createAuthServiceWithHistory({
  userRepository,
  loginHistoryRepository,
  jwtSecret
}: AuthServiceWithHistoryConfig) {
  async function authenticate(
    payload: unknown,
    ipAddress?: string,
    userAgent?: string
  ) {
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        ok: false as const,
        reason: 'validation' as const,
        issues: parsed.error.issues
      };
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await userRepository.findByEmail(email);

    if (!user) {
      // Track failed login attempt (user doesn't exist)
      const loginAttempt: Omit<LoginHistoryEntry, 'id'> = {
        userId: null,
        email: email.toLowerCase(),
        success: false,
        ipAddress,
        userAgent,
        attemptedAt: new Date()
      };
      await loginHistoryRepository.create(loginAttempt);
      return { ok: false as const, reason: 'invalid-credentials' as const };
    }

    // Track login attempt (success or failure)
    const loginAttempt: Omit<LoginHistoryEntry, 'id'> = {
      userId: user.id,
      email: email.toLowerCase(),
      success: false,
      ipAddress,
      userAgent,
      attemptedAt: new Date()
    };

    // Verify password
    const matches = await bcrypt.compare(password, user.passwordHash);

    if (!matches) {
      // Track failed login attempt
      await loginHistoryRepository.create(loginAttempt);
      return { ok: false as const, reason: 'invalid-credentials' as const };
    }

    // Track successful login
    loginAttempt.success = true;
    loginAttempt.userId = user.id;
    await loginHistoryRepository.create(loginAttempt);

    // Generate token
    const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret, {
      expiresIn: '1h'
    });

    return {
      ok: true as const,
      token,
      user: sanitizeUser(user)
    };
  }

  return { authenticate };
}

