
import { PrismaClient } from '@prisma/client';
// Mocking PrismaService if import fails or just using PrismaClient cast
class MockPrismaService extends PrismaClient {
    async onModuleInit() { await this.$connect(); }
}

// Minimal implementation of Repository to avoid imports hell if needed, 
// OR try to import the real one. Let's try importing the real one first.
// If it fails, I'll copy the code here.
import { PrismaUserRepository } from './src/modules/users/infrastructure/repositories/prisma-user.repository';
// Warning: PrismaUserRepository depends on PrismaService (NestJS). 
// Let's assume we can simply pass our MockPrismaService as it extends PrismaClient and matches the shape used.

async function main() {
    const prisma = new MockPrismaService();
    // @ts-ignore
    const repo = new PrismaUserRepository(prisma);

    try {
        // 1. Create
        console.log('Creating user...');
        const email = `test-soft-${Date.now()}@test.com`;
        const user = await repo.create({ email, password: '123', name: 'Soft Tester' });
        console.log('Created User ID:', user.id);

        // 2. Find (Active)
        const found = await repo.findById(user.id);
        if (found) {
            console.log('✅ Found active user via Repository');
        } else {
            console.error('❌ Failed to find active user');
        }

        // 3. Delete (Soft)
        console.log('Deleting user (soft)...');
        await repo.delete(user.id);

        // 4. Find (Should be null)
        const foundAfter = await repo.findById(user.id);
        if (foundAfter === null) {
            console.log('✅ User not found via Repository after soft delete');
        } else {
            console.error('❌ User STILL FOUND after soft delete!');
        }

        // 5. Verify DB Raw
        const raw = await prisma.user.findUnique({ where: { id: user.id } });
        if (raw && raw.deletedAt) {
            console.log('✅ Raw DB check confirms deletedAt is set:', raw.deletedAt);
        } else {
            console.error('❌ Raw DB check failed: deletedAt is null or record missing');
        }

    } catch (e) {
        console.error('Error during verification:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
