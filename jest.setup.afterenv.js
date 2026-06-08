/**
 * @file jest.setup.afterenv.js
 * @description Setup global untuk Jest — dijalankan setelah framework loaded
 */

const { sequelize } = require('./src/models');

// Timeout global 15 detik (karena ada DB connection)
jest.setTimeout(15000);

// Suppress console.log, console.warn & console.error saat testing agar output bersih
global.console.log   = jest.fn();
global.console.warn  = jest.fn();
global.console.error = jest.fn();

// Koneksi & sinkronisasi DB sebelum semua test berjalan
beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: false });
});

// Tutup koneksi DB setelah semua test selesai
afterAll(async () => {
  await sequelize.close();
});