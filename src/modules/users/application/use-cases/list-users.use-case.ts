import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { UserOutput } from '../dtos';

export interface ListUsersOptions {
    page?: number;
    perPage?: number;
}

export interface ListUsersResult {
    data: UserOutput[];
    meta: {
        total: number;
        page: number;
        perPage: number;
        lastPage: number;
    };
}

@Injectable()
export class ListUsersUseCase {
    private readonly logger = new Logger(ListUsersUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(options: ListUsersOptions = {}): Promise<ListUsersResult> {
        const page = options.page ?? 1;
        const perPage = Math.min(options.perPage ?? 20, 100);
        const skip = (page - 1) * perPage;

        this.logger.log(`Listing users - page: ${page}, perPage: ${perPage}`);

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);

        return {
            data: users.map(UserOutput.fromEntity),
            meta: {
                total,
                page,
                perPage,
                lastPage: Math.ceil(total / perPage),
            },
        };
    }
}
