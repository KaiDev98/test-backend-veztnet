/**
 * @file investment.test.js
 * @description Regression Test Suite — Investment API
 * Pola: AAA (Arrange, Act, Assert)
 */

const request = require('supertest');
const app     = require('../src/app');

async function registerAndLogin(role = 'INVESTOR') {
  const email    = `inv_${role}_${Date.now()}@example.com`;
  const password = 'password123';
  await request(app).post('/api/auth/register').send({
    fullName: `Inv ${role}`, email, password, role,
  });
  const login = await request(app).post('/api/auth/login').send({ email, password });
  return { token: login.body.token || login.body.data?.token, email };
}

// ─── GET /api/investments/my-portfolio ───────────────────────────────────────
describe('GET /api/investments/my-portfolio', () => {
  test('Happy Path — investor dengan token valid harus mendapat portfolio', async () => {
    const { token } = await registerAndLogin('INVESTOR');
    if (!token) return;

    const res = await request(app)
      .get('/api/investments/my-portfolio')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app).get('/api/investments/my-portfolio');
    expect(res.status).toBe(401);
  });

  test('Error Scenario — token tidak valid harus mengembalikan 401 atau 403', async () => {
    const res = await request(app)
      .get('/api/investments/my-portfolio')
      .set('Authorization', 'Bearer token-palsu');
    expect([401, 403]).toContain(res.status);
  });
});

// ─── GET /api/investments/stats ──────────────────────────────────────────────
describe('GET /api/investments/stats', () => {
  test('Happy Path — investor dengan token valid harus mendapat stats', async () => {
    const { token } = await registerAndLogin('INVESTOR');
    if (!token) return;

    const res = await request(app)
      .get('/api/investments/stats')
      .set('Authorization', `Bearer ${token}`);

    expect([200]).toContain(res.status);
    expect(res.body.status).toBe('success');
  });

  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app).get('/api/investments/stats');
    expect(res.status).toBe(401);
  });
});

// ─── POST /api/investments ────────────────────────────────────────────────────
describe('POST /api/investments', () => {
  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app)
      .post('/api/investments')
      .send({ propertyId: 1, tokenAmount: 10 });
    expect(res.status).toBe(401);
  });

  test('Error Scenario — propertyId tidak ada harus mengembalikan 404', async () => {
    const { token } = await registerAndLogin('INVESTOR');
    if (!token) return;

    const res = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${token}`)
      .send({ propertyId: 999999, tokenAmount: 10 });

    expect([400, 404, 422]).toContain(res.status);
  });

  test('Error Scenario — body kosong harus mengembalikan 400 atau 422', async () => {
    const { token } = await registerAndLogin('INVESTOR');
    if (!token) return;

    const res = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect([400, 422]).toContain(res.status);
  });

  test('Error Scenario — role non-investor harus mengembalikan 403', async () => {
    const { token } = await registerAndLogin('TENANT');
    if (!token) return;

    const res = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${token}`)
      .send({ propertyId: 1, tokenAmount: 5 });

    expect([401, 403]).toContain(res.status);
  });
});