import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { registerDev, registerCompany, login } from './helpers';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE users CASCADE');
  });

  afterAll(async () => {
    await dataSource.query('TRUNCATE TABLE users CASCADE');
    await app.close();
  });

  // =========================================
  // POST /api/v1/auth/register/dev
  // =========================================
  describe('POST /api/v1/auth/register/dev', () => {
    it('should register a new dev and return tokens', async () => {
      const res = await registerDev(app).expect(201);

      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data).toHaveProperty('refresh_token');
      expect(res.body.data.user.role).toBe('dev');
      expect(res.body.data.user.email).toBe('dev@test.com');
      expect(res.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should return 409 if email already exists', async () => {
      await registerDev(app).expect(201);
      const res = await registerDev(app).expect(409);

      expect(res.body.message).toBe('E-mail já cadastrado.');
    });

    it('should return 400 if password confirmation does not match', async () => {
      const res = await registerDev(app, {
        password_confirmation: 'wrong',
      }).expect(400);

      expect(res.body.message).toBe('As senhas não coincidem.');
    });

    it('should return 400 if email is invalid', async () => {
      const res = await registerDev(app, {
        email: 'not-an-email',
      }).expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should return 400 if password is too short', async () => {
      const res = await registerDev(app, {
        password: '123',
        password_confirmation: '123',
      }).expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register/dev')
        .send({
          email: 'dev@test.com',
          password: 'senha12345',
          password_confirmation: 'senha12345',
        })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });
  });

  // =========================================
  // POST /api/v1/auth/register/company
  // =========================================
  describe('POST /api/v1/auth/register/company', () => {
    it('should register a new company and return tokens', async () => {
      const res = await registerCompany(app).expect(201);

      expect(res.body.data.user.role).toBe('company');
      expect(res.body.data.user.email).toBe('company@test.com');
      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data).toHaveProperty('refresh_token');
    });

    it('should return 409 if email already exists', async () => {
      await registerCompany(app).expect(201);
      const res = await registerCompany(app).expect(409);

      expect(res.body.message).toBe('E-mail já cadastrado.');
    });
  });

  // =========================================
  // POST /api/v1/auth/login
  // =========================================
  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      await registerDev(app);
      const res = await login(app, 'dev@test.com', 'senha12345').expect(200);

      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data).toHaveProperty('refresh_token');
      expect(res.body.data.user.email).toBe('dev@test.com');
    });

    it('should return 401 with wrong password', async () => {
      await registerDev(app);
      const res = await login(app, 'dev@test.com', 'wrongpassword').expect(401);

      expect(res.body.message).toBe('Credenciais inválidas.');
    });

    it('should return 401 with non-existent email', async () => {
      const res = await login(app, 'nobody@test.com', 'senha12345').expect(401);

      expect(res.body.message).toBe('Credenciais inválidas.');
    });

    it('should return 400 if email is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: 'senha12345' })
        .expect(400);
    });

    it('should return 400 if password is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'dev@test.com' })
        .expect(400);
    });
  });

  // =========================================
  // POST /api/v1/auth/refresh
  // =========================================
  describe('POST /api/v1/auth/refresh', () => {
    it('should return new tokens with valid refresh token', async () => {
      const registerRes = await registerDev(app);
      const refreshToken = registerRes.body.data.refresh_token;

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data).toHaveProperty('refresh_token');
      expect(typeof res.body.data.access_token).toBe('string');
      expect(typeof res.body.data.refresh_token).toBe('string');
    });

    it('should return 401 with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refresh_token: 'invalid.token.here' })
        .expect(401);
    });
  });

  // =========================================
  // POST /api/v1/auth/logout
  // =========================================
  describe('POST /api/v1/auth/logout', () => {
    it('should logout with valid access token', async () => {
      const registerRes = await registerDev(app);
      const accessToken = registerRes.body.data.access_token;

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.message).toBe('Logout realizado com sucesso.');
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });
});
