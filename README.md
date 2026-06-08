# PropShare Backend API

![CI](https://github.com/KaiDev98/test-backend-veztnet/actions/workflows/test.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)

Platform Investasi Properti Berbasis Web3 — REST API menggunakan Express.js + Sequelize + PostgreSQL.

---

## 🚀 Cara Menjalankan Project

### 1. Clone repository
```bash
git clone https://github.com/KaiDev98/test-backend-veztnet.git
cd test-backend-veztnet
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment
```bash
cp .env.example .env
```

### 4. Jalankan migrasi database
```bash
npm run db:migrate
```

### 5. Jalankan server
```bash
npm run dev
```

---

## 🧪 Cara Menjalankan Test

### Persiapan
```bash
cp .env.test.example .env.test
npm install
```

Isi token JWT di `.env.test` — jalankan server dev, login sebagai ADMIN/OWNER/INVESTOR, lalu copy token ke `.env.test`.

### Menjalankan Test
```bash
# Jalankan semua test
npm test

# Jalankan test + laporan coverage
npm run test:coverage

# Jalankan test dalam mode watch
npm run test:watch
```

### Output Test (Aktual)

Test Suites: 7 passed, 7 total
Tests:       82 passed, 82 total
Snapshots:   0 total
Time:        7.679s

### Output Coverage (Aktual)
------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------------|---------|----------|---------|---------|-------------------
All files               |     100 |      100 |     100 |     100 |                   
 models                 |     100 |      100 |     100 |     100 |                   
  Dividend.js           |     100 |      100 |     100 |     100 |                   
  Investment.js         |     100 |      100 |     100 |     100 |                   
  MarketplaceListing.js |     100 |      100 |     100 |     100 |                   
  Notification.js       |     100 |      100 |     100 |     100 |                   
  Payment.js            |     100 |      100 |     100 |     100 |                   
  Property.js           |     100 |      100 |     100 |     100 |                   
  PropertyImage.js      |     100 |      100 |     100 |     100 |                   
  Rental.js             |     100 |      100 |     100 |     100 |                   
  Report.js             |     100 |      100 |     100 |     100 |                   
  Review.js             |     100 |      100 |     100 |     100 |                   
  Room.js               |     100 |      100 |     100 |     100 |                   
  User.js               |     100 |      100 |     100 |     100 |                   
 routes                 |     100 |      100 |     100 |     100 |                   
  dividendRoutes.js     |     100 |      100 |     100 |     100 |                   
  index.js              |     100 |      100 |     100 |     100 |                   
  investmentRoutes.js   |     100 |      100 |     100 |     100 |                   
  paymentRoutes.js      |     100 |      100 |     100 |     100 |                   
  rentalRoutes.js       |     100 |      100 |     100 |     100 |                   
  reportRoutes.js       |     100 |      100 |     100 |     100 |                   
  roomRoutes.js         |     100 |      100 |     100 |     100 |                   
------------------------|---------|----------|---------|---------|-------------------
Test Suites: 7 passed, 7 total
Tests:       82 passed, 82 total
Snapshots:   0 total
Time:        11.214 s

## 📁 Struktur Folder
test-backend-veztnet/
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── services/
├── tests/
│   ├── auth.test.js
│   ├── divident.test.js
│   ├── investmen.test.js
│   ├── property.test.js
│   ├── rental.test.js
│   ├── report.test.js
│   └── user.test.js
├── .github/
│   └── workflows/
│       └── test.yml
├── jest.config.js
├── jest.setup.js
├── jest.setup.afterenv.js
├── .env.test.example
└── README.md

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | /api/health | — | Health check |
| GET | /api/properties/marketplace/investor | — | Properti ACTIVE |
| GET | /api/properties/marketplace/tenant | — | Properti sewa |
| GET | /api/properties/:id | — | Detail properti |
| GET | /api/properties | ADMIN | Semua properti |
| POST | /api/properties | OWNER | Buat properti baru |
| PATCH | /api/properties/:id/status | ADMIN | Update status |
| PATCH | /api/properties/:id/claim | OWNER | Klaim dana |
| POST | /api/properties/:id/invest | INVESTOR | Investasi |

---

## ⚙️ CI/CD

Pipeline otomatis berjalan di GitHub Actions setiap push atau pull request ke branch main/master/develop.

Pipeline meliputi:
1. Setup PostgreSQL service container
2. Install dependencies (npm ci)
3. Sinkronisasi database (sequelize-cli db:migrate)
4. Jalankan test + coverage
5. Upload laporan coverage sebagai artifact (retention 7 hari)

## 🔐 Environment Variables

Buat file .env.test dari template:

```bash
cp .env.test.example .env.test
```

| Variable | Keterangan |
|----------|------------|
| DB_HOST | Host database PostgreSQL |
| DB_PORT | Port database (default: 5432) |
| DB_USER | Username database |
| DB_PASS | Password database |
| DB_NAME | Nama database test |
| JWT_SECRET | Secret key JWT |
| TEST_ADMIN_TOKEN | Token JWT role ADMIN |
| TEST_OWNER_TOKEN | Token JWT role OWNER |
| TEST_INVESTOR_TOKEN | Token JWT role INVESTOR |