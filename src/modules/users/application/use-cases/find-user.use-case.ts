import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import type { IUserRepository } from '../interfaces/user-repository.interface';
import { UserOutput } from '../dtos';

// ARCH-001/002: Use case now depends on IUserRepository interface (application layer)
// instead of PrismaService (infrastructure layer) - follows Dependency Inversion Principle
@Injectable()
export class FindUserUseCase {
    private readonly logger = new Logger(FindUserUseCase.name);

    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(id: string): Promise<UserOutput> {
        this.logger.log(`Finding user with ID: ${id}`);

        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        return UserOutput.fromEntity(user);
    }
}
