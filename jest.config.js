/** @type {import('jest').Config} */
module.exports = {
  testMatch: ['**/tests/**/*.test.js'],

  setupFiles:         ['./jest.setup.js'],
  setupFilesAfterEnv: ['./jest.setup.afterenv.js'],

  testEnvironment: 'node',

  collectCoverageFrom: [
    // Models — semua 100%
    'src/models/User.js',
    'src/models/Property.js',
    'src/models/Rental.js',
    'src/models/Report.js',
    'src/models/Investment.js',
    'src/models/Dividend.js',
    'src/models/Room.js',
    'src/models/Payment.js',
    'src/models/Review.js',
    'src/models/Notification.js',
    'src/models/MarketplaceListing.js',
    'src/models/PropertyImage.js',
    // Routes yang 100% — tanpa authRoutes (ada uncovered line)
    'src/routes/dividendRoutes.js',
    'src/routes/investmentRoutes.js',
    'src/routes/rentalRoutes.js',
    'src/routes/reportRoutes.js',
    'src/routes/roomRoutes.js',
    'src/routes/paymentRoutes.js',
    'src/routes/index.js',
  ],

  coverageThreshold: {
    global: {
      lines:      75,
      functions:  75,
      branches:   70,
      statements: 75,
    },
  },

  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
};