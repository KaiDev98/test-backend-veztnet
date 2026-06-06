# PropShare Backend API

Platform investasi properti berbasis Web3 — memungkinkan investor membeli token kepemilikan properti kost, menerima dividen otomatis, dan tenant melakukan booking sewa secara digital.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Salin file .env dan isi variabel
cp .env .env.local

# 3. Jalankan migrasi database
npm run db:migrate

# 4. (Opsional) Jalankan seeder
npm run db:seed

# 5. Jalankan server (development)
npm run dev
```

---

## 📁 Struktur Folder

```
propshare-backend/
├── src/
│   ├── config/
│   │   └── db.js                        # Sequelize instance & koneksi
│   ├── controllers/                     # Logika bisnis per modul
│   │   ├── authController.js
│   │   ├── contactController.js
│   │   ├── dividendController.js
│   │   ├── investmentController.js
│   │   ├── propertyController.js
│   │   ├── rentalController.js
│   │   ├── reportController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js            # JWT guard
│   │   └── roleMiddleware.js            # RBAC guard
│   ├── migrations/
│   │   └── 20260521-add-property-status-enum.js
│   ├── models/                          # Sequelize model definitions
│   │   ├── Dividend.js
│   │   ├── index.js                     # Asosiasi antar model
│   │   ├── Investment.js
│   │   ├── MarketplaceListing.js
│   │   ├── Notification.js
│   │   ├── Payment.js
│   │   ├── Property.js
│   │   ├── PropertyImage.js
│   │   ├── Rental.js
│   │   ├── Report.js
│   │   ├── Review.js
│   │   ├── Room.js
│   │   └── User.js
│   ├── routes/
│   │   ├── index.js                     # Router utama
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── dividendRoutes.js
│   │   ├── investmentRoutes.js
│   │   ├── marketplaceListingRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── propertyRoutes.js
│   │   ├── rentalRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── roomRoutes.js
│   │   └── uploadRoutes.js
│   ├── scripts/
│   │   └── addPropertyStatus.js
│   ├── services/
│   │   ├── propertyService.js           # Sequelize queries - Property
│   │   └── userService.js              # Sequelize queries - User
│   ├── utils/
│   │   ├── ipfsHelper.js               # Upload file ke Pinata/IPFS
│   │   ├── notificationHelper.js
│   │   └── web3Helper.js
│   └── app.js                          # Entry point Express
├── uploads/                            # File upload lokal (sementara)
├── .env
├── package.json
└── README.md
```

---

## 🔐 Autentikasi

Semua endpoint protected menggunakan JWT Bearer Token.

```
Authorization: Bearer <token>
```

### Roles
| Role       | Akses                                   |
|------------|-----------------------------------------|
| `ADMIN`    | Approve properti, distribusi dividen    |
| `OWNER`    | CRUD properti, verifikasi pembayaran    |
| `INVESTOR` | Investasi, lihat portfolio & dividen    |
| `TENANT`   | Booking kamar, upload bukti bayar       |

---

## 📡 API Endpoints

### Auth & User
| Method | Endpoint                    | Deskripsi                    | Akses  |
|--------|-----------------------------|------------------------------|--------|
| POST   | `/api/auth/register`        | Registrasi user baru         | Public |
| POST   | `/api/auth/login`           | Login konvensional (JWT)     | Public |
| POST   | `/api/auth/web3-login`      | Login via wallet address     | Public |
| GET    | `/api/auth/users/profile`   | Ambil profil user            | All    |
| PUT    | `/api/auth/users/profile`   | Update profil & avatar       | All    |

### Properti
| Method | Endpoint                        | Deskripsi                    | Akses    |
|--------|---------------------------------|------------------------------|----------|
| GET    | `/api/properties`               | List semua properti          | Public   |
| GET    | `/api/properties/:id`           | Detail properti              | Public   |
| POST   | `/api/properties`               | Ajukan properti baru         | Owner    |
| GET    | `/api/properties/my-listings`   | Properti milik Owner         | Owner    |
| PATCH  | `/api/properties/:id/status`    | Approve / Reject properti    | Admin    |

### Marketplace Listing
| Method | Endpoint                            | Deskripsi                    | Akses    |
|--------|-------------------------------------|------------------------------|----------|
| GET    | `/api/marketplace`                  | List properti di marketplace | Public   |
| GET    | `/api/marketplace/:id`              | Detail listing marketplace   | Public   |

### Investasi
| Method | Endpoint                          | Deskripsi                   | Akses    |
|--------|-----------------------------------|-----------------------------|----------|
| POST   | `/api/investments`                | Catat investasi baru        | Investor |
| GET    | `/api/investments/my-portfolio`   | Portfolio investor           | Investor |
| GET    | `/api/investments/stats`          | Statistik grafik aset       | Investor |

### Kamar & Sewa
| Method | Endpoint                    | Deskripsi                  | Akses  |
|--------|-----------------------------|----------------------------|--------|
| GET    | `/api/rooms/:propertyId`    | List kamar tersedia        | Public |
| POST   | `/api/rentals`              | Booking kamar              | Tenant |
| GET    | `/api/rentals/my-rentals`   | Riwayat sewa               | Tenant |
| POST   | `/api/payments`             | Upload bukti bayar         | Tenant |

### Dividen
| Method | Endpoint                        | Deskripsi                  | Akses    |
|--------|---------------------------------|----------------------------|----------|
| PATCH  | `/api/payments/:id/verify`      | Verifikasi pembayaran      | Owner    |
| POST   | `/api/dividends/distribute`     | Distribusi dividen         | Admin    |
| GET    | `/api/dividends/history`        | Riwayat dividen diterima   | Investor |

### Review & Report
| Method | Endpoint                        | Deskripsi                  | Akses    |
|--------|---------------------------------|----------------------------|----------|
| POST   | `/api/reviews`                  | Tambah ulasan properti     | Tenant   |
| GET    | `/api/reviews/:propertyId`      | List ulasan properti       | Public   |
| POST   | `/api/reports`                  | Buat laporan               | All      |
| GET    | `/api/reports`                  | List laporan               | Admin    |

### Notifikasi
| Method | Endpoint                        | Deskripsi                  | Akses  |
|--------|---------------------------------|----------------------------|--------|
| GET    | `/api/notifications`            | List notifikasi user       | All    |
| PATCH  | `/api/notifications/:id/read`   | Tandai sudah dibaca        | All    |

### Upload
| Method | Endpoint          | Deskripsi                    | Akses |
|--------|-------------------|------------------------------|-------|
| POST   | `/api/upload`     | Upload file ke IPFS/lokal    | All   |

---

## 🧪 Contoh Request — Investasi

```json
POST /api/investments
Authorization: Bearer <token>

{
  "propertyId": "uuid-properti-abc",
  "tokenAmount": 50,
  "totalPaid": 500000,
  "txHash": "0xabc123...789"
}
```

**Response 201:**
```json
{
  "status": "success",
  "message": "Investasi berhasil dicatat",
  "data": {
    "investmentId": "uuid-inv-123",
    "confirmedAt": "2026-03-11T20:00:00Z"
  }
}
```

---

## 🗄️ Database (Sequelize)

Project ini menggunakan **Sequelize ORM** dengan PostgreSQL.

### Menjalankan Migrasi

```bash
# Jalankan semua migrasi yang belum dijalankan
npm run db:migrate

# Rollback migrasi terakhir
npm run db:migrate:undo

# Rollback semua migrasi
npm run db:migrate:undo:all
```

### Menjalankan Seeder

```bash
# Jalankan semua seeder
npm run db:seed

# Rollback semua seeder
npm run db:seed:undo:all
```

### Membuat Migrasi Baru

```bash
npx sequelize-cli migration:generate --name nama-migrasi
```

---

## 🌐 Environment Variables

| Key                      | Deskripsi                          |
|--------------------------|------------------------------------|
| `DATABASE_URL`           | PostgreSQL connection string       |
| `DB_HOST`                | Host database                      |
| `DB_PORT`                | Port database (default: `5432`)    |
| `DB_NAME`                | Nama database                      |
| `DB_USER`                | Username database                  |
| `DB_PASSWORD`            | Password database                  |
| `JWT_SECRET`             | Secret key untuk signing JWT       |
| `JWT_EXPIRES_IN`         | Durasi token (default: `7d`)       |
| `PORT`                   | Port server (default: `3000`)      |
| `PINATA_API_KEY`         | API Key Pinata untuk IPFS          |
| `PINATA_SECRET_API_KEY`  | Secret Key Pinata                  |
| `PINATA_GATEWAY_URL`     | URL gateway IPFS Pinata            |