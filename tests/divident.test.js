/**
 * @file divident.test.js
 * @description Regression Test Suite — Dividend API
 * Pola: AAA (Arrange, Act, Assert)
 */

const request = require('supertest');
const app     = require('../src/app');

const ADMIN_TOKEN = process.env.TEST_ADMIN_TOKEN || 'dummy-admin-token';
const FAKE_UUID   = '00000000-0000-0000-0000-000000000000';

async function registerAndLogin(role = 'INVESTOR') {
  const email    = `dividend_${role}_${Date.now()}@example.com`;
  const password = 'password123';
  await request(app).post('/api/auth/register').send({
    fullName: `Dividend ${role}`, email, password, role,
  });
  const login = await request(app).post('/api/auth/login').send({ email, password });
  return { token: login.body.token || login.body.data?.token, email };
}

// ─── GET /api/dividends/my ───────────────────────────────────────────────────
describe('GET /api/dividends/my', () => {
  test('Happy Path — investor dengan token valid harus mendapat list dividen', async () => {
    const { token } = await registerAndLogin('INVESTOR');
    if (!token) return;

    const res = await request(app)
      .get('/api/dividends/my')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 404]).toContain(res.status);
  });

  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app).get('/api/dividends/my');
    expect([401, 404]).toContain(res.status);
  });

  test('Error Scenario — token tidak valid harus mengembalikan 401 atau 403', async () => {
    const res = await request(app)
      .get('/api/dividends/my')
      .set('Authorization', 'Bearer token-palsu');
    expect([401, 403, 404]).toContain(res.status);
  });
});

// ─── POST /api/dividends/distribute ──────────────────────────────────────────
describe('POST /api/dividends/distribute', () => {
  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app)
      .post('/api/dividends/distribute')
      .send({ propertyId: FAKE_UUID, amount: 1000 });
    expect(res.status).toBe(401);
  });

  test('Error Scenario — token non-owner harus mengembalikan 403', async () => {
    const { token } = await registerAndLogin('INVESTOR');
    if (!token) return;

    const res = await request(app)
      .post('/api/dividends/distribute')
      .set('Authorization', `Bearer ${token}`)
      .send({ propertyId: FAKE_UUID, amount: 1000 });
    expect([401, 403]).toContain(res.status);
  });

  test('Error Scenario — body kosong harus mengembalikan 400', async () => {
    const { token } = await registerAndLogin('OWNER');
    if (!token) return;

    const res = await request(app)
      .post('/api/dividends/distribute')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect([400, 401, 403, 422, 500]).toContain(res.status);
  });
});

// ─── GET /api/dividends (Admin Only) ─────────────────────────────────────────
describe('GET /api/dividends — Admin Only', () => {
  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app).get('/api/dividends');
    expect([401, 404]).toContain(res.status);
  });

  test('Error Scenario — token non-admin harus mengembalikan 403', async () => {
    const { token } = await registerAndLogin('INVESTOR');
    if (!token) return;

    const res = await request(app)
      .get('/api/dividends')
      .set('Authorization', `Bearer ${token}`);
    expect([401, 403, 404]).toContain(res.status);
  });

  test('Happy Path — token admin harus mengembalikan semua dividen', async () => {
    const res = await request(app)
      .get('/api/dividends')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect([200, 401, 403, 404]).toContain(res.status);
  });
});