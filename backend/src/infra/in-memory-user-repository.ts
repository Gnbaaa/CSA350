import { randomUUID } from 'node:crypto';
import { User, UserRepository } from '../domain/user';

export function createInMemoryUserRepository(): UserRepository {
  const usersByEmail = new Map<string, User>();

  async function findByEmail(email: string): Promise<User | null> {
    return usersByEmail.get(email.toLowerCase()) ?? null;
  }

  async function create(user: Omit<User, 'id'>): Promise<User> {
    const id = randomUUID();
    const entity: User = { ...user, id };
    usersByEmail.set(entity.email.toLowerCase(), entity);
    return entity;
  }

  return { findByEmail, create };
}

