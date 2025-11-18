import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserRepository, UserRole } from '../domain/user';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const ngoRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(2)
});

interface SanitizedUser {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
  role: UserRole;
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

export interface AuthServiceConfig {
  userRepository: UserRepository;
  jwtSecret: string;
}

export function createAuthService({ userRepository, jwtSecret }: AuthServiceConfig) {
  async function register(payload: unknown) {
    const parsed = signupSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        ok: false as const,
        reason: 'validation' as const,
        issues: parsed.error.issues
      };
    }

    const { email, password, fullName } = parsed.data;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return { ok: false as const, reason: 'conflict' as const };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date();

    const user = await userRepository.create({
      email,
      fullName,
      passwordHash,
      createdAt,
      role: 'citizen'
    });

    return {
      ok: true as const,
      user: sanitizeUser(user)
    };
  }

  async function registerNgo(payload: unknown) {
    const parsed = ngoRegistrationSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        ok: false as const,
        reason: 'validation' as const,
        issues: parsed.error.issues
      };
    }

    const { email, password, organizationName } = parsed.data;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return { ok: false as const, reason: 'conflict' as const };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date();

    const user = await userRepository.create({
      email,
      fullName: organizationName,
      passwordHash,
      createdAt,
      role: 'ngo'
    });

    return {
      ok: true as const,
      user: sanitizeUser(user)
    };
  }

  async function authenticate(payload: unknown) {
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        ok: false as const,
        reason: 'validation' as const,
        issues: parsed.error.issues
      };
    }

    const { email, password } = parsed.data;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { ok: false as const, reason: 'invalid-credentials' as const };
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return { ok: false as const, reason: 'invalid-credentials' as const };
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: '1h' });

    return {
      ok: true as const,
      token,
      user: sanitizeUser(user)
    };
  }

  return { register, authenticate, registerNgo };
}

