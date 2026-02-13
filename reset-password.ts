
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'tononvalter@gmail.com';
    const newPassword = '123456';

    try {
        console.log(`Resetting password for user: ${email}`);

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error(`User with email ${email} not found!`);
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword
            }
        });

        console.log(`Password reset successfully for ${email}`);
        console.log(`New temporary password: ${newPassword}`);

    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
