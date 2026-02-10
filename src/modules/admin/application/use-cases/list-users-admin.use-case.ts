import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ListUsersAdminInput } from '../dtos/list-users-admin.input';
import { Prisma } from '@prisma/client';

@Injectable()
export class ListUsersAdminUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(input: ListUsersAdminInput) {
        const { page = 1, perPage = 20, search, role, sort = '-createdAt' } = input;
        const skip = (page - 1) * perPage;

        // Build where clause
        const where: Prisma.UserWhereInput = {
            deleted_at: null,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (role) {
            where.role = role;
        }

        // Build orderBy from sort string (e.g. "-createdAt" = desc, "createdAt" = asc)
        const orderDirection = sort.startsWith('-') ? 'desc' : 'asc';
        const orderField = sort.replace(/^-/, '');
        const orderBy: Prisma.UserOrderByWithRelationInput = {
            [orderField]: orderDirection,
        };

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: perPage,
                orderBy,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    deleted_at: true,
                    subscription: {
                        select: {
                            id: true,
                            status: true,
                            startDate: true,
                            endDate: true,
                            plan: {
                                select: {
                                    id: true,
                                    name: true,
                                    displayName: true,
                                    price: true,
                                    interval: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                perPage,
                lastPage: Math.ceil(total / perPage),
            },
        };
    }
}
