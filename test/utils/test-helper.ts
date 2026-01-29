import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export class TestHelper {
    constructor(
        private readonly app: INestApplication,
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async cleanDatabase() {
        // Ordem importa devido a chaves estrangeiras
        await this.prisma.philosophy.deleteMany();
        await this.prisma.asset.deleteMany();
        await this.prisma.user.deleteMany();
    }

    async createUser(email?: string, password = 'password123') {
        const finalEmail = email || `test-${Date.now()}-${Math.random()}@example.com`;
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.prisma.user.create({
            data: {
                email: finalEmail,
                password: hashedPassword,
                name: 'Test User',
            },
        });
    }

    generateToken(userId: string) {
        return this.jwtService.sign({ sub: userId, email: 'test@example.com' });
    }
}
