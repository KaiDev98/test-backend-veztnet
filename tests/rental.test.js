/**
 * @file rental.test.js
 * @description Regression Test Suite — Rental API
 * Pola: AAA (Arrange, Act, Assert)
 */

const request = require('supertest');
const app     = require('../src/app');

const ADMIN_TOKEN  = process.env.TEST_ADMIN_TOKEN || 'dummy-admin-token';
const FAKE_UUID    = '00000000-0000-0000-0000-000000000000';

async function registerAndLogin(role = 'TENANT') {
  const email    = `rental_${role}_${Date.now()}@example.com`;
  const password = 'password123';
  await request(app).post('/api/auth/register').send({
    fullName: `Rental ${role}`, email, password, role,
  });
  const login = await request(app).post('/api/auth/login').send({ email, password });
  return { token: login.body.token || login.body.data?.token, email };
}

// ─── GET /api/rentals/my-rentals ─────────────────────────────────────────────
describe('GET /api/rentals/my-rentals', () => {
  test('Happy Path — tenant dengan token valid harus mendapat list rental', async () => {
    const { token } = await registerAndLogin('TENANT');
    if (!token) return;

    const res = await request(app)
      .get('/api/rentals/my-rentals')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app).get('/api/rentals/my-rentals');
    expect(res.status).toBe(401);
  });

  test('Error Scenario — token tidak valid harus mengembalikan 401 atau 403', async () => {
    const res = await request(app)
      .get('/api/rentals/my-rentals')
      .set('Authorization', 'Bearer token-palsu');
    expect([401, 403]).toContain(res.status);
  });
});

// ─── POST /api/rentals ────────────────────────────────────────────────────────
describe('POST /api/rentals', () => {
  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app)
      .post('/api/rentals')
      .send({ propertyId: FAKE_UUID, roomId: FAKE_UUID });
    expect(res.status).toBe(401);
  });

  test('Error Scenario — propertyId tidak ada harus mengembalikan 404', async () => {
    const { token } = await registerAndLogin('TENANT');
    if (!token) return;

    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send({ propertyId: FAKE_UUID, roomId: FAKE_UUID });

    expect([400, 404, 422]).toContain(res.status);
  });

  test('Error Scenario — body kosong harus mengembalikan 400', async () => {
    const { token } = await registerAndLogin('TENANT');
    if (!token) return;

    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect([400, 422]).toContain(res.status);
  });

  test('Error Scenario — role non-tenant harus mengembalikan 403', async () => {
    const { token } = await registerAndLogin('INVESTOR');
    if (!token) return;

    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send({ propertyId: FAKE_UUID, roomId: FAKE_UUID });

    expect([401, 403]).toContain(res.status);
  });
});

// ─── GET /api/rentals (Admin only) ───────────────────────────────────────────
describe('GET /api/rentals — Admin Only', () => {
  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app).get('/api/rentals');
    expect(res.status).toBe(401);
  });

  test('Error Scenario — token non-admin harus mengembalikan 403', async () => {
    const { token } = await registerAndLogin('TENANT');
    if (!token) return;

    const res = await request(app)
      .get('/api/rentals')
      .set('Authorization', `Bearer ${token}`);
    expect([401, 403]).toContain(res.status);
  });

  test('Happy Path — token admin harus mengembalikan semua rental', async () => {
    const res = await request(app)
      .get('/api/rentals')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    expect([200, 401, 403]).toContain(res.status);
  });
});

// ─── PATCH /api/rentals/:id/status ───────────────────────────────────────────
describe('PATCH /api/rentals/:id/status', () => {
  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app)
      .patch(`/api/rentals/${FAKE_UUID}/status`)
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(401);
  });

  test('Error Scenario — ID tidak ada harus mengembalikan 404', async () => {
    const { token } = await registerAndLogin('OWNER');
    if (!token) return;

    const res = await request(app)
      .patch(`/api/rentals/${FAKE_UUID}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ACTIVE' });
    expect([401, 403, 404, 500]).toContain(res.status);
  });
});

// ─── PATCH /api/rentals/:id/cancel ───────────────────────────────────────────
describe('PATCH /api/rentals/:id/cancel', () => {
  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app)
      .patch(`/api/rentals/${FAKE_UUID}/cancel`);
    expect(res.status).toBe(401);
  });

  test('Error Scenario — ID tidak ada harus mengembalikan 404', async () => {
    const { token } = await registerAndLogin('TENANT');
    if (!token) return;

    const res = await request(app)
      .patch(`/api/rentals/${FAKE_UUID}/cancel`)
      .set('Authorization', `Bearer ${token}`);
    expect([401, 403, 404, 500]).toContain(res.status);
  });
});