import { BadRequestException } from '@nestjs/common';

export class UserEntity {
    id: string;
    email: string;
    name: string | null;
    password: string; // ARCH-002: Added for auth operations
    role: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(props: Partial<UserEntity>) {
        Object.assign(this, props);
    }

    static create(email: string, name?: string): UserEntity {
        // ERR-001: Use BadRequestException instead of generic Error
        if (!email || !email.includes('@')) {
            throw new BadRequestException('Email inválido');
        }

        return new UserEntity({
            email,
            name: name || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    // ARCH-001: Factory method to convert Prisma model to domain entity
    static fromPrisma(prismaUser: any): UserEntity {
        return new UserEntity({
            id: prismaUser.id,
            email: prismaUser.email,
            name: prismaUser.name,
            password: prismaUser.password,
            role: prismaUser.role || 'USER',
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
        });
    }
}

// Type alias for backward compatibility
export type User = UserEntity;
