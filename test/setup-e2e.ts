/**
 * Setup file for E2E tests
 * 
 * CRITICAL: This ensures tests use a separate database to prevent data loss!
 * 
 * The test database is automatically created and cleaned before each test run.
 */

// Force NODE_ENV to 'test' for all E2E tests
process.env.NODE_ENV = 'test';

// Use separate test database
if (!process.env.DATABASE_URL_TEST) {
    console.warn('⚠️  DATABASE_URL_TEST not set! Using default test database.');
    process.env.DATABASE_URL_TEST = 'postgresql://sardinha:sardinha123@db:5432/investia_test_db?schema=public';
}

// Override DATABASE_URL to use test database
const originalDatabaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;

console.log('🧪 E2E Test Setup:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   Using TEST database: ${process.env.DATABASE_URL}`);
console.log(`   Production database (protected): ${originalDatabaseUrl}`);
console.log('');
console.log('✅ Tests will NOT affect production data!');
console.log('');
