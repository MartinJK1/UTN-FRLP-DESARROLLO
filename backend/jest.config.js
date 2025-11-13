
try {
  require('dotenv').config();
} catch (error) {

}

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'], // Archivo para configurar Prisma teardown
};