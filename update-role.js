const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setSuperAdmin() {
    try {
        const user = await prisma.user.update({
            where: { email: 'tononvalter@gmail.com' },
            data: { role: 'SUPER_ADMIN' } // Using string literal as enum
        });
        console.log('✅ User updated to SUPER_ADMIN:', user.email, user.role);
    } catch (error) {
        console.error('❌ Failed to update role:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setSuperAdmin();
