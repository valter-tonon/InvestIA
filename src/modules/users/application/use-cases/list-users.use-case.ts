import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IUserRepository } from '../interfaces/user-repository.interface';
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

// ARCH-001/002: Use case now depends on IUserRepository interface
@Injectable()
export class ListUsersUseCase {
    private readonly logger = new Logger(ListUsersUseCase.name);

    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(options: ListUsersOptions = {}): Promise<ListUsersResult> {
        const page = options.page ?? 1;
        const perPage = Math.min(options.perPage ?? 20, 100);

        this.logger.log(`Listing users - page: ${page}, perPage: ${perPage}`);

        const [users, total] = await Promise.all([
            this.userRepository.findAll(page, perPage),
            this.userRepository.count(),
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
