export type UserRole = 'admin' | 'ngo' | 'citizen';

export interface User {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: Date;
  role: UserRole;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id'>): Promise<User>;
}

