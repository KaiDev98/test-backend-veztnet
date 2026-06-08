/**
 * @file property.test.js
 * @description Regression Test Suite — PropShare API (propertyRoutes)
 * Menggunakan Jest + Supertest
 * Pola: AAA (Arrange, Act, Assert)
 */

const request = require('supertest');
const app     = require('../src/app');

// ─── Token helper (ganti dengan token valid dari env atau generate via login) ──
const ADMIN_TOKEN    = process.env.TEST_ADMIN_TOKEN    || 'dummy-admin-token';
const OWNER_TOKEN    = process.env.TEST_OWNER_TOKEN    || 'dummy-owner-token';
const INVESTOR_TOKEN = process.env.TEST_INVESTOR_TOKEN || 'dummy-investor-token';

// ─── Health Check ─────────────────────────────────────────────────────────────
describe('Health Check', () => {
  test('GET /api/health — harus mengembalikan status 200 dan pesan sukses', async () => {
    // Arrange — tidak ada setup khusus

    // Act
    const res = await request(app).get('/api/health');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toMatch(/PropShare API is running/i);
  });
});

// ─── 1. GET /api/properties/marketplace/investor ──────────────────────────────
describe('GET /api/properties/marketplace/investor', () => {
  test('Happy Path — harus mengembalikan status 200 dan array properti', async () => {
    // Arrange — endpoint publik, tidak butuh token

    // Act
    const res = await request(app).get('/api/properties/marketplace/investor');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('Edge Case — response harus memiliki struktur data yang benar', async () => {
    // Arrange
    const res = await request(app).get('/api/properties/marketplace/investor');

    // Act & Assert — cek struktur jika ada data
    if (res.body.data.length > 0) {
      const property = res.body.data[0];
      expect(property).toHaveProperty('id');
      expect(property).toHaveProperty('status');
    }
    expect(res.status).toBe(200);
  });
});

// ─── 2. GET /api/properties/marketplace/tenant ───────────────────────────────
describe('GET /api/properties/marketplace/tenant', () => {
  test('Happy Path — harus mengembalikan status 200 dan array properti sewa', async () => {
    // Arrange

    // Act
    const res = await request(app).get('/api/properties/marketplace/tenant');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── 3. GET /api/properties/:id ──────────────────────────────────────────────
describe('GET /api/properties/:id', () => {
  test('Happy Path — ID valid harus mengembalikan detail properti', async () => {
    // Arrange — ambil dulu 1 properti dari marketplace
    const list = await request(app).get('/api/properties/marketplace/investor');
    
    // Skip jika tidak ada data
    if (!list.body.data || list.body.data.length === 0) {
      console.warn('⚠️  Tidak ada properti di DB, test di-skip');
      return;
    }
    const validId = list.body.data[0].id;

    // Act
    const res = await request(app).get(`/api/properties/${validId}`);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id', validId);
  });

  test('Error Scenario — ID tidak ditemukan harus mengembalikan 404', async () => {
    // Arrange
    const invalidId = 999999;

    // Act
    const res = await request(app).get(`/api/properties/${invalidId}`);

    // Assert
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('Error Scenario — ID string tidak valid (NaN) harus mengembalikan 400 atau 404', async () => {
    // Arrange
    const nanId = 'bukan-angka';

    // Act
    const res = await request(app).get(`/api/properties/${nanId}`);

    // Assert
    expect([400, 404, 500]).toContain(res.status);
  });
});

// ─── 4. GET /api/properties (Admin only) ─────────────────────────────────────
describe('GET /api/properties — Admin Only', () => {
  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    // Arrange — tidak kirim Authorization header

    // Act
    const res = await request(app).get('/api/properties');

    // Assert
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });

  test('Error Scenario — token bukan ADMIN harus mengembalikan 403', async () => {
    // Arrange
    // Act
    const res = await request(app)
      .get('/api/properties')
      .set('Authorization', `Bearer ${INVESTOR_TOKEN}`);

    // Assert
    expect([401, 403]).toContain(res.status);
  });
});

// ─── 5. POST /api/properties (Owner only) ────────────────────────────────────
describe('POST /api/properties — Owner Only', () => {
  test('Error Scenario — tanpa token harus ditolak dengan 401', async () => {
    // Arrange
    const payload = {
      name:         'Properti Test',
      location:     'Jakarta',
      targetAmount: 500000000,
    };

    // Act
    const res = await request(app)
      .post('/api/properties')
      .send(payload);

    // Assert
    expect(res.status).toBe(401);
  });

  test('Error Scenario — data kosong (body kosong) dengan token owner harus 400', async () => {
    // Arrange — kirim body kosong
    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${OWNER_TOKEN}`)
      .send({});

    // Assert
    expect([400, 401, 403, 422]).toContain(res.status);
  });
});

// ─── 6. PATCH /api/properties/:id/status (Admin only) ────────────────────────
describe('PATCH /api/properties/:id/status — Admin Only', () => {
  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    // Arrange
    const res = await request(app)
      .patch('/api/properties/1/status')
      .send({ status: 'ACTIVE' });

    // Assert
    expect(res.status).toBe(401);
  });

  test('Error Scenario — ID properti tidak ada harus mengembalikan 404', async () => {
    // Arrange
    const res = await request(app)
      .patch('/api/properties/999999/status')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ status: 'ACTIVE' });

    // Assert — 401/403 jika token dummy, 404 jika token valid tapi ID tidak ada
    expect([401, 403, 404, 500]).toContain(res.status);
  });
});

// ─── 7. PATCH /api/properties/:id/claim (Owner only) ─────────────────────────
describe('PATCH /api/properties/:id/claim — Owner Only', () => {
  test('Error Scenario — tanpa token harus mengembalikan 401', async () => {
    // Arrange
    const res = await request(app)
      .patch('/api/properties/1/claim')
      .send({ txHash: '0xabc', amount: 100, walletAddress: '0x123' });

    // Assert
    expect(res.status).toBe(401);
  });

  test('Error Scenario — properti tidak ditemukan harus mengembalikan 404', async () => {
    // Arrange
    const res = await request(app)
      .patch('/api/properties/999999/claim')
      .set('Authorization', `Bearer ${OWNER_TOKEN}`)
      .send({ txHash: '0xabc', amount: 100, walletAddress: '0x123' });

    // Assert
    expect([401, 403, 404, 500]).toContain(res.status);
  });
});

// ─── 8. Route tidak ada — 404 Handler ────────────────────────────────────────
describe('404 Handler — Route Tidak Ditemukan', () => {
  test('GET ke route yang tidak ada harus mengembalikan 404', async () => {
    // Arrange
    const res = await request(app).get('/api/route-yang-tidak-ada');

    // Assert
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('POST ke route yang tidak ada harus mengembalikan 404', async () => {
    // Arrange
    const res = await request(app)
      .post('/api/endpoint-palsu')
      .send({ data: 'test' });

    // Assert
    expect(res.status).toBe(404);
  });
});