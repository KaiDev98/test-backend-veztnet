'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cek apakah enum sudah ada, kalau belum buat dulu
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'enum_properties_status'
        ) THEN
          CREATE TYPE "enum_properties_status" AS ENUM (
            'DRAFT', 'PENDING', 'ACTIVE', 'INACTIVE', 'SOLD',
            'READY_TO_RENT', 'FULLY_OCCUPIED'
          );
        ELSE
          ALTER TYPE "enum_properties_status" 
            ADD VALUE IF NOT EXISTS 'READY_TO_RENT';
          ALTER TYPE "enum_properties_status" 
            ADD VALUE IF NOT EXISTS 'FULLY_OCCUPIED';
        END IF;
      END $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    console.warn('Rollback ENUM value tidak didukung PostgreSQL');
  },
};