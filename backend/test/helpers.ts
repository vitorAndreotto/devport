import { INestApplication } from '@nestjs/common';
import request from 'supertest';

const devPayload = {
  name: 'testdev',
  email: 'dev@test.com',
  password: 'senha12345',
  password_confirmation: 'senha12345',
};

const companyPayload = {
  name: 'testcompany',
  email: 'company@test.com',
  password: 'senha12345',
  password_confirmation: 'senha12345',
};

export function registerDev(app: INestApplication, overrides: Record<string, unknown> = {}) {
  return request(app.getHttpServer())
    .post('/api/v1/auth/register/dev')
    .send({ ...devPayload, ...overrides });
}

export function registerCompany(app: INestApplication, overrides: Record<string, unknown> = {}) {
  return request(app.getHttpServer())
    .post('/api/v1/auth/register/company')
    .send({ ...companyPayload, ...overrides });
}

export function login(app: INestApplication, email: string, password: string) {
  return request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email, password });
}

export async function getDevToken(app: INestApplication): Promise<string> {
  const res = await registerDev(app);
  return res.body.data.access_token;
}

export async function getCompanyToken(app: INestApplication): Promise<string> {
  const res = await registerCompany(app);
  return res.body.data.access_token;
}
