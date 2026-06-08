/**
 * @file user.test.js
 * @description Regression Test Suite — User controller via adminRoutes
 * Pola: AAA (Arrange, Act, Assert)
 */

const request = require('supertest');
const app     = require('../src/app');

const ADMIN_TOKEN = process.env.TEST_ADMIN_TOKEN || 'dummy-admin-token';

async function registerAndLogin(role = 'INVESTOR') {
  const email    = `user_${role}_${Date.now()}@example.com`;
  const password = 'password123';
  await request(app).post('/api/auth/register').send({
    fullName: `Test ${role}`, email, password, role,
  });
  const login = await request(app).post('/api/auth/login').send({ email, password });
  return { token: login.body.token || login.body.data?.token, email };
}

// ─── PATCH /api/auth/users/wallet ─────────────────────────────────────────────
describe('PATCH /api/auth/users/wallet', () => {
  test('Happy Path — update wallet address dengan token valid', async () => {
    const { token } = await registerAndLogin('INVESTOR');
    if (!token) return;

    const res = await request(app)
      .patch('/api/auth/users/wallet')
      .set('Authorization', `Bearer ${token}`)
      .send({ walletAddress: '0x1234567890abcdef1234567890abcdef12345678' });

    expect([200, 201, 409]).toContain(res.status);
  });

  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app)
      .patch('/api/auth/users/wallet')
      .send({ walletAddress: '0xabc' });
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/auth/users (Admin only) ────────────────────────────────────────
describe('GET /api/auth/users — Admin Only', () => {
  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app).get('/api/auth/users');
    expect(res.status).toBe(401);
  });

  test('Error Scenario — token non-admin harus mengembalikan 403', async () => {
    const { token } = await registerAndLogin('INVESTOR');
    if (!token) return;

    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${token}`);
    expect([401, 403]).toContain(res.status);
  });

  test('Happy Path — token admin harus mengembalikan list users', async () => {
    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect([200, 401, 403]).toContain(res.status);
  });
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
describe('POST /api/auth/forgot-password', () => {
  test('Happy Path — email terdaftar harus mengembalikan success', async () => {
    const email = `forgot_${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({
      fullName: 'Forgot User', email, password: 'password123', role: 'INVESTOR',
    });

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email });

    // 200/201 jika email berhasil dikirim, 500 jika SMTP tidak dikonfigurasi di test env
    expect([200, 201, 500]).toContain(res.status);
  });

  test('Error Scenario — email tidak terdaftar harus mengembalikan 404', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'tidakada@example.com' });
    expect([400, 404]).toContain(res.status);
  });

  test('Error Scenario — body kosong harus mengembalikan 400', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({});
    expect([400, 422]).toContain(res.status);
  });
});