# PropShare Backend API

![CI](https://github.com/KaiDev98/test-backend-veztnet/actions/workflows/test.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-75%25-green)

> **Ganti `USERNAME/REPO_NAME`** dengan username dan nama repo GitHub kamu.

Platform Investasi Properti Berbasis Web3 — REST API menggunakan Express.js + Sequelize + PostgreSQL.

---

## 🚀 Cara Menjalankan Project

```bash
# 1. Clone repository
git clone https://github.com/KaiDev98/test-backend-veztnet.git
cd test-backend-veztnet

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env sesuai konfigurasi database kamu

# 4. Jalankan migrasi database
npm run db:migrate

# 5. Jalankan server
npm run dev
```

---

## 🧪 Cara Menjalankan Test

### Persiapan
```bash
# 1. Buat file .env.test dari template
cp .env.test.example .env.test

# 2. Isi token untuk testing di .env.test
#    Jalankan server dev, login sebagai ADMIN/OWNER/INVESTOR
#    Copy token JWT ke .env.test

# 3. Install dev dependencies (jika belum)
npm install
```

### Menjalankan Test
```bash
# Jalankan semua test
npm test

# Jalankan test + laporan coverage
npm run test:coverage

# Jalankan test dalam mode watch (auto re-run saat file berubah)
npm run test:watch
```

### Contoh Output Test
```
PASS tests/property.test.js
  Health Check
    ✓ GET /api/health — harus mengembalikan status 200 dan pesan sukses (120ms)
  GET /api/properties/marketplace/investor
    ✓ Happy Path — harus mengembalikan status 200 dan array properti (85ms)
    ✓ Edge Case — response harus memiliki struktur data yang benar (32ms)
  ...

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
```

### Contoh Output Coverage
```
----------|---------|----------|---------|---------|
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
All files |   80.00 |   75.00  |  100.00 |   80.00 |
----------|---------|----------|---------|---------|
```

> Screenshot hasil coverage ada di folder `coverage/` setelah menjalankan `npm run test:coverage`

---

## 📁 Struktur Folder

```
propshare-backend/
├── src/
│   ├── app.js              # Entry point Express
│   ├── routes/             # Definisi route
│   ├── controllers/        # Business logic
│   ├── models/             # Sequelize models
│   └── middlewares/        # Auth & role middleware
├── tests/
│   └── property.test.js    # Test suite utama
├── .github/
│   └── workflows/
│       └── test.yml        # GitHub Actions CI
├── jest.config.js          # Konfigurasi Jest
├── jest.setup.js           # Setup global Jest
└── .env.test.example       # Template env untuk testing
```

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/health` | — | Health check |
| GET | `/api/properties/marketplace/investor` | — | Properti ACTIVE |
| GET | `/api/properties/marketplace/tenant` | — | Properti sewa |
| GET | `/api/properties/:id` | — | Detail properti |
| GET | `/api/properties` | ADMIN | Semua properti |
| POST | `/api/properties` | OWNER | Buat properti baru |
| PATCH | `/api/properties/:id/status` | ADMIN | Update status |
| PATCH | `/api/properties/:id/claim` | OWNER | Klaim dana |
| POST | `/api/properties/:id/invest` | INVESTOR | Investasi |

---

## ⚙️ CI/CD

Pipeline otomatis berjalan di GitHub Actions setiap kali ada **push** atau **pull request** ke branch `main`/`master`/`develop`.

Pipeline meliputi:
1. Setup PostgreSQL service container
2. Install dependencies
3. Sinkronisasi database
4. Jalankan test + coverage
5. Upload laporan coverage sebagai artifact
