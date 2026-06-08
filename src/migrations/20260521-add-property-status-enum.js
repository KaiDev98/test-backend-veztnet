'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cek dulu apakah enum sudah ada, kalau belum buat dulu
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_properties_status') THEN
          CREATE TYPE "enum_properties_status" AS ENUM (
            'DRAFT', 'PENDING', 'ACTIVE', 'INACTIVE', 'SOLD'
          );
        END IF;
      END $$;
    `);

    -- Tambah nilai baru
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_properties_status" ADD VALUE IF NOT EXISTS 'READY_TO_RENT';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_properties_status" ADD VALUE IF NOT EXISTS 'FULLY_OCCUPIED';`
    );
  },

  async down(queryInterface, Sequelize) {
    console.warn('Rollback ENUM value tidak didukung PostgreSQL');
  },
};