import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserRepository, UserRole } from '../domain/user';
import { ValidationError, ConflictError, UnauthorizedError, DatabaseError } from '../errors/app-error';
import { logger } from '../utils/logger';

const signupSchema = z.object({
  email: z.string().email({ message: 'Зөв имэйл хаяг оруулна уу' }),
  password: z.string().min(8, { message: 'Нууц үг хамгийн багадаа 8 тэмдэгт байна' }),
  fullName: z.string().min(2, { message: 'Нэр хамгийн багадаа 2 тэмдэгт байна' })
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Зөв имэйл хаяг оруулна уу' }),
  password: z.string().min(8, { message: 'Нууц үг хамгийн багадаа 8 тэмдэгт байна' })
});

const ngoRegistrationSchema = z.object({
  email: z.string().email({ message: 'Зөв имэйл хаяг оруулна уу' }),
  password: z.string().min(8, { message: 'Нууц үг хамгийн багадаа 8 тэмдэгт байна' }),
  organizationName: z.string().min(2, { message: 'Байгууллагын нэр хамгийн багадаа 2 тэмдэгт байна' })
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

/**
 * Exception-based auth service
 * Алдаа гарвал exception шиднэ
 */
export function createAuthServiceV2({ userRepository, jwtSecret }: AuthServiceConfig) {
  async function register(payload: unknown) {
    // Validation
    const parsed = signupSchema.safeParse(payload);
    if (!parsed.success) {
      const issues = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      throw new ValidationError('Бүртгэлийн мэдээлэл буруу байна', { issues });
    }

    const { email, password, fullName } = parsed.data;

    // Check for existing user
    try {
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictError('Энэ имэйл хаяг аль хэдийн бүртгэлтэй байна', { email });
      }
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      logger.error('Database error while checking existing user', error);
      throw new DatabaseError('Хэрэглэгчийн мэдээллийг шалгахад алдаа гарлаа');
    }

    // Create user
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const createdAt = new Date();

      const user = await userRepository.create({
        email,
        fullName,
        passwordHash,
        createdAt,
        role: 'citizen'
      });

      logger.info('User registered successfully', { email, userId: user.id });
      return sanitizeUser(user);
    } catch (error) {
      logger.error('Database error while creating user', error);
      throw new DatabaseError('Хэрэглэгч бүртгэхэд алдаа гарлаа');
    }
  }

  async function registerNgo(payload: unknown) {
    // Validation
    const parsed = ngoRegistrationSchema.safeParse(payload);
    if (!parsed.success) {
      const issues = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      throw new ValidationError('ТББ-ийн бүртгэлийн мэдээлэл буруу байна', { issues });
    }

    const { email, password, organizationName } = parsed.data;

    // Check for existing user
    try {
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictError('Энэ имэйл хаяг аль хэдийн бүртгэлтэй байна', { email });
      }
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      logger.error('Database error while checking existing NGO', error);
      throw new DatabaseError('ТББ-ийн мэдээллийг шалгахад алдаа гарлаа');
    }

    // Create NGO user
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const createdAt = new Date();

      const user = await userRepository.create({
        email,
        fullName: organizationName,
        passwordHash,
        createdAt,
        role: 'ngo'
      });

      logger.info('NGO registered successfully', { email, userId: user.id });
      return sanitizeUser(user);
    } catch (error) {
      logger.error('Database error while creating NGO', error);
      throw new DatabaseError('ТББ бүртгэхэд алдаа гарлаа');
    }
  }

  async function authenticate(payload: unknown) {
    // Validation
    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) {
      const issues = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      throw new ValidationError('Нэвтрэх мэдээлэл буруу байна', { issues });
    }

    const { email, password } = parsed.data;

    // Find user
    let user;
    try {
      user = await userRepository.findByEmail(email);
    } catch (error) {
      logger.error('Database error while finding user for authentication', error);
      throw new DatabaseError('Хэрэглэгчийн мэдээллийг авахад алдаа гарлаа');
    }

    if (!user) {
      throw new UnauthorizedError('Имэйл эсвэл нууц үг буруу байна');
    }

    // Verify password
    let matches: boolean;
    try {
      matches = await bcrypt.compare(password, user.passwordHash);
    } catch (error) {
      logger.error('Error comparing password', error);
      throw new DatabaseError('Нууц үг шалгахад алдаа гарлаа');
    }

    if (!matches) {
      throw new UnauthorizedError('Имэйл эсвэл нууц үг буруу байна');
    }

    // Generate token
    try {
      const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: '1h' });
      logger.info('User authenticated successfully', { email, userId: user.id });
      
      return {
        token,
        user: sanitizeUser(user)
      };
    } catch (error) {
      logger.error('Error generating JWT token', error);
      throw new DatabaseError('Токен үүсгэхэд алдаа гарлаа');
    }
  }

  return { register, authenticate, registerNgo };
}

