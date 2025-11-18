import bcrypt from 'bcryptjs';
import request from 'supertest';
import { UserRepository, UserRole } from '../domain/user';
import { createInMemoryUserRepository } from '../infra/in-memory-user-repository';
import { createServer } from '../server';

const jwtSecret = 'test-secret';

describe('Auth API', () => {
  let app: ReturnType<typeof createServer>;

  const signupPayload = {
    email: 'user@example.com',
    password: 'StrongP@ssw0rd',
    fullName: 'Test User'
  };

  beforeEach(() => {
    const userRepository = createInMemoryUserRepository();
    app = createServer({ userRepository, jwtSecret });
  });

  it('registers a new user with hashed password', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send(signupPayload)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Account created',
        user: {
          id: expect.any(String),
          email: signupPayload.email,
          fullName: signupPayload.fullName,
          createdAt: expect.any(String),
          role: 'citizen'
        }
      })
    );

    expect(response.body.user).not.toHaveProperty('password');
  });

  it('rejects duplicate registration requests', async () => {
    await request(app).post('/api/auth/signup').send(signupPayload).expect(201);

    const response = await request(app)
      .post('/api/auth/signup')
      .send(signupPayload)
      .expect(409);

    expect(response.body).toEqual({
      error: 'Email already in use'
    });
  });

  it('validates incoming payloads', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'bad-email', password: 'short', fullName: '' })
      .expect(400);

    expect(response.body.error).toBe('Invalid signup data');
    expect(Array.isArray(response.body.details)).toBe(true);
  });

  it('issues tokens on successful login and returns role', async () => {
    await request(app).post('/api/auth/signup').send(signupPayload).expect(201);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: signupPayload.email, password: signupPayload.password })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Authenticated',
        token: expect.any(String),
        user: expect.objectContaining({
          email: signupPayload.email,
          role: 'citizen'
        })
      })
    );
  });

  it('rejects invalid credentials', async () => {
    await request(app).post('/api/auth/signup').send(signupPayload).expect(201);

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: signupPayload.email, password: 'incorrect' })
      .expect(401);

    expect(wrongPassword.body).toEqual({ error: 'Invalid credentials' });
  });
});

describe('Admin API', () => {
  const adminCredentials = {
    email: 'admin@example.com',
    password: 'AdminP@ss1',
    fullName: 'Admin User'
  };

  let app: ReturnType<typeof createServer>;
  let userRepository: UserRepository;

  async function seedAdmin(repo: UserRepository) {
    const passwordHash = await bcrypt.hash(adminCredentials.password, 10);
    await repo.create({
      email: adminCredentials.email,
      fullName: adminCredentials.fullName,
      passwordHash,
      createdAt: new Date(),
      role: 'admin'
    });
  }

  beforeEach(async () => {
    userRepository = createInMemoryUserRepository();
    await seedAdmin(userRepository);
    app = createServer({ userRepository, jwtSecret });
  });

  async function authenticate(role: UserRole = 'admin') {
    const credentials =
      role === 'admin'
        ? { email: adminCredentials.email, password: adminCredentials.password }
        : { email: 'user@example.com', password: 'StrongP@ssw0rd' };

    const response = await request(app).post('/api/auth/login').send(credentials).expect(200);
    return response.body.token as string;
  }

  it('allows an admin to register an NGO account', async () => {
    const token = await authenticate('admin');

    const ngoPayload = {
      email: 'ngo@example.com',
      password: 'NGoStrong1!',
      organizationName: 'Happy Paws Shelter'
    };

    const response = await request(app)
      .post('/api/admin/ngos')
      .set('Authorization', `Bearer ${token}`)
      .send(ngoPayload)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'NGO account created',
        user: expect.objectContaining({
          email: ngoPayload.email,
          fullName: ngoPayload.organizationName,
          role: 'ngo'
        })
      })
    );

    await request(app)
      .post('/api/auth/login')
      .send({ email: ngoPayload.email, password: ngoPayload.password })
      .expect(200);
  });

  it('rejects NGO registration when requester is not admin', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'user@example.com', password: 'StrongP@ssw0rd', fullName: 'User' })
      .expect(201);

    const userToken = await authenticate('citizen');

    await request(app)
      .post('/api/admin/ngos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ email: 'ngo-2@example.com', password: 'NGoStrong1!', organizationName: 'Shelter' })
      .expect(403);
  });

  it('rejects NGO registration without token', async () => {
    await request(app)
      .post('/api/admin/ngos')
      .send({ email: 'ngo-3@example.com', password: 'NGoStrong1!', organizationName: 'Shelter' })
      .expect(401);
  });
});

