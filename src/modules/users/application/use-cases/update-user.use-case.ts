import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import type { IUserRepository } from '../interfaces/user-repository.interface';
import { UpdateUserInput, UserOutput } from '../dtos';

// ARCH-001/002: Use case now depends on IUserRepository interface
@Injectable()
export class UpdateUserUseCase {
    private readonly logger = new Logger(UpdateUserUseCase.name);

    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(id: string, input: UpdateUserInput): Promise<UserOutput> {
        this.logger.log(`Updating user with ID: ${id}`);

        // Verificar se usuário existe
        const existingUser = await this.userRepository.findById(id);

        if (!existingUser) {
            throw new NotFoundException('Usuário não encontrado');
        }

        const user = await this.userRepository.update(id, {
            name: input.name,
        });

        this.logger.log(`User updated: ${user.id}`);
        return UserOutput.fromEntity(user);
    }
}
