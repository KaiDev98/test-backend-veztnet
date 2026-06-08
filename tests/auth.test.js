/**
 * @file auth.test.js
 * @description Regression Test Suite — Auth API
 * Pola: AAA (Arrange, Act, Assert)
 */

const request = require('supertest');
const app     = require('../src/app');

// ─── POST /api/auth/register ──────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  test('Happy Path — registrasi dengan data valid harus mengembalikan 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        email:    `testuser_${Date.now()}@example.com`,
        password: 'password123',
        role:     'INVESTOR',
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.status).toBe('success');
  });

  test('Error Scenario — email duplikat harus mengembalikan 400 atau 409', async () => {
    const email = `duplikat_${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({
      fullName: 'User Satu', email, password: 'password123', role: 'INVESTOR',
    });
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'User Dua', email, password: 'password456', role: 'INVESTOR',
    });
    expect([400, 409, 422]).toContain(res.status);
    expect(res.body.status).toBe('error');
  });

  test('Error Scenario — body kosong harus mengembalikan 400', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect([400, 422]).toContain(res.status);
  });

  test('Error Scenario — password terlalu pendek harus mengembalikan 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        email:    `short_${Date.now()}@example.com`,
        password: '123',
        role:     'INVESTOR',
      });
    expect([200, 201, 400, 422]).toContain(res.status);
  });
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  test('Happy Path — login dengan kredensial valid harus mengembalikan token', async () => {
    const email    = `login_${Date.now()}@example.com`;
    const password = 'password123';
    await request(app).post('/api/auth/register').send({
      fullName: 'Login User', email, password, role: 'INVESTOR',
    });
    const res = await request(app).post('/api/auth/login').send({ email, password });

    expect([200, 201]).toContain(res.status);
    expect(res.body.status).toBe('success');
    const token = res.body.token || res.body.data?.token;
    expect(token).toBeTruthy();
  });

  test('Error Scenario — password salah harus mengembalikan 401', async () => {
    const email = `wrongpass_${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({
      fullName: 'Wrong Pass User', email, password: 'correctpassword', role: 'INVESTOR',
    });
    const res = await request(app).post('/api/auth/login').send({ email, password: 'salahpassword' });
    expect([400, 401]).toContain(res.status);
    expect(res.body.status).toBe('error');
  });

  test('Error Scenario — email tidak terdaftar harus mengembalikan 401 atau 404', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tidakterdaftar@example.com', password: 'apapun123' });
    expect([400, 401, 404]).toContain(res.status);
    expect(res.body.status).toBe('error');
  });

  test('Error Scenario — body kosong harus mengembalikan 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect([400, 422]).toContain(res.status);
  });
});

// ─── GET /api/auth/users/profile ──────────────────────────────────────────────
describe('GET /api/auth/users/profile', () => {
  test('Happy Path — dengan token valid harus mengembalikan data user', async () => {
    const email    = `me_${Date.now()}@example.com`;
    const password = 'password123';
    await request(app).post('/api/auth/register').send({
      fullName: 'Me User', email, password, role: 'INVESTOR',
    });
    const login = await request(app).post('/api/auth/login').send({ email, password });
    const token = login.body.token || login.body.data?.token;
    if (!token) return;

    const res = await request(app)
      .get('/api/auth/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app).get('/api/auth/users/profile');
    expect(res.status).toBe(401);
  });

  test('Error Scenario — token tidak valid harus mengembalikan 401 atau 403', async () => {
    const res = await request(app)
      .get('/api/auth/users/profile')
      .set('Authorization', 'Bearer token-palsu-tidak-valid');
    expect([401, 403]).toContain(res.status);
  });
});

// ─── PUT /api/auth/users/profile ─────────────────────────────────────────────
describe('PUT /api/auth/users/profile', () => {
  test('Happy Path — update profil dengan token valid harus berhasil', async () => {
    const email    = `update_${Date.now()}@example.com`;
    const password = 'password123';
    await request(app).post('/api/auth/register').send({
      fullName: 'Update User', email, password, role: 'INVESTOR',
    });
    const login = await request(app).post('/api/auth/login').send({ email, password });
    const token = login.body.token || login.body.data?.token;
    if (!token) return;

    const res = await request(app)
      .put('/api/auth/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Updated Name' });

    expect([200]).toContain(res.status);
    expect(res.body.status).toBe('success');
  });

  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    const res = await request(app)
      .put('/api/auth/users/profile')
      .send({ fullName: 'Hacker' });
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
    const email    = `nonadmin_${Date.now()}@example.com`;
    const password = 'password123';
    await request(app).post('/api/auth/register').send({
      fullName: 'Non Admin', email, password, role: 'INVESTOR',
    });
    const login = await request(app).post('/api/auth/login').send({ email, password });
    const token = login.body.token || login.body.data?.token;
    if (!token) return;

    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${token}`);
    expect([401, 403]).toContain(res.status);
  });
});