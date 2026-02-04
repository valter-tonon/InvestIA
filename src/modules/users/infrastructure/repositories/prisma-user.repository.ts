import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { IUserRepository } from '../../application/interfaces/user-repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

/**
 * Prisma implementation of IUserRepository
 * Infrastructure layer - concrete implementation using Prisma ORM
 */
@Injectable()
export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                deleted_at: null, // DB-004: Filter soft deleted
            },
        });

        return user ? UserEntity.fromPrisma(user) : null;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                email,
                deleted_at: null, // DB-004: Filter soft deleted
            },
        });

        return user ? UserEntity.fromPrisma(user) : null;
    }

    async findAll(page: number, limit: number): Promise<UserEntity[]> {
        const skip = (page - 1) * limit;

        const users = await this.prisma.user.findMany({
            where: {
                deleted_at: null, // DB-004: Filter soft deleted
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        return users.map(user => UserEntity.fromPrisma(user));
    }

    async create(data: { email: string; name?: string; password: string }): Promise<UserEntity> {
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: data.password,
            },
        });

        return UserEntity.fromPrisma(user);
    }

    async update(id: string, data: { email?: string; name?: string; password?: string }): Promise<UserEntity> {
        const user = await this.prisma.user.update({
            where: { id },
            data,
        });

        return UserEntity.fromPrisma(user);
    }

    async delete(id: string): Promise<void> {
        // DB-004: Soft delete implementation
        await this.prisma.user.update({
            where: { id },
            data: {
                deleted_at: new Date(),
            },
        });
    }

    async count(): Promise<number> {
        return this.prisma.user.count({
            where: {
                deleted_at: null, // DB-004: Count only active users
            },
        });
    }
}
