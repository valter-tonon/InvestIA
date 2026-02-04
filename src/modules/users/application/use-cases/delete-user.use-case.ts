import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import type { IUserRepository } from '../interfaces/user-repository.interface';

// ARCH-001/002: Use case now depends on IUserRepository interface
@Injectable()
export class DeleteUserUseCase {
    private readonly logger = new Logger(DeleteUserUseCase.name);

    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(id: string): Promise<void> {
        this.logger.log(`Deleting user with ID: ${id}`);

        // Verificar se usuário existe
        const existingUser = await this.userRepository.findById(id);

        if (!existingUser) {
            throw new NotFoundException('Usuário não encontrado');
        }

        await this.userRepository.delete(id);

        this.logger.log(`User deleted: ${id}`);
    }
}
