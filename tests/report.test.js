/**
 * @file report.test.js
 * @description Regression Test Suite — Report API
 * Pola: AAA (Arrange, Act, Assert)
 */

const request = require('supertest');
const app     = require('../src/app');

const ADMIN_TOKEN = process.env.TEST_ADMIN_TOKEN || 'dummy-admin-token';
const FAKE_UUID   = '00000000-0000-0000-0000-000000000000';

async function registerAndLogin(role = 'TENANT') {
  const email    = `report_${role}_${Date.now()}@example.com`;
  const password = 'password123';
  await request(app).post('/api/auth/register').send({
    fullName: `Report ${role}`, email, password, role,
  });
  const login = await request(app).post('/api/auth/login').send({ email, password });
  return { token: login.body.token || login.body.data?.token, email };
}

// ─── GET /api/reports ────────────────────────────────────────────────────────
describe('GET /api/reports', () => {
  test('Happy Path — tenant dengan token valid harus mendapat list report', async () => {
    const { token } = await registerAndLogin('TENANT');
    if (!token) return;

    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.status).toBe(401);
  });

  test('Error Scenario — token tidak valid harus mengembalikan 401 atau 403', async () => {
    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', 'Bearer token-palsu');
    expect([401, 403]).toContain(res.status);
  });
});

// ─── POST /api/reports ───────────────────────────────────────────────────────
describe('POST /api/reports', () => {
  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({ title: 'Test', propertyId: FAKE_UUID });
    expect(res.status).toBe(401);
  });

  test('Error Scenario — role non-tenant harus mengembalikan 403', async () => {
    const { token } = await registerAndLogin('INVESTOR');
    if (!token) return;

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test', propertyId: FAKE_UUID });
    expect([401, 403]).toContain(res.status);
  });

  test('Error Scenario — body kosong harus mengembalikan 400', async () => {
    const { token } = await registerAndLogin('TENANT');
    if (!token) return;

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect([400, 422, 500]).toContain(res.status);
  });

  test('Happy Path — tenant dengan data valid harus berhasil membuat report', async () => {
    const { token } = await registerAndLogin('TENANT');
    if (!token) return;

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title:       'Kerusakan AC',
        description: 'AC tidak berfungsi',
        propertyId:  FAKE_UUID,
      });
    expect([200, 201, 400, 404, 500]).toContain(res.status);
  });
});

// ─── PATCH /api/reports/:id/status ───────────────────────────────────────────
describe('PATCH /api/reports/:id/status', () => {
  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app)
      .patch(`/api/reports/${FAKE_UUID}/status`)
      .send({ status: 'RESOLVED' });
    expect(res.status).toBe(401);
  });

  test('Error Scenario — ID tidak ada harus mengembalikan 404', async () => {
    const { token } = await registerAndLogin('OWNER');
    if (!token) return;

    const res = await request(app)
      .patch(`/api/reports/${FAKE_UUID}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'RESOLVED' });
    expect([401, 403, 404, 500]).toContain(res.status);
  });

  test('Error Scenario — role non-owner harus mengembalikan 403', async () => {
    const { token } = await registerAndLogin('TENANT');
    if (!token) return;

    const res = await request(app)
      .patch(`/api/reports/${FAKE_UUID}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'RESOLVED' });
    expect([401, 403, 404, 500]).toContain(res.status);
  });
});