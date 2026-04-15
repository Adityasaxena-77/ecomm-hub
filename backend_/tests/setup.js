import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomm-test';

// Global test setup
global.beforeAll = global.beforeAll || (() => {});
global.afterAll = global.afterAll || (() => {});
global.beforeEach = global.beforeEach || (() => {});
global.afterEach = global.afterEach || (() => {});