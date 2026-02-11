import { Injectable, NotFoundException, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import type { IUserRepository } from '../interfaces/user-repository.interface';
import { PasswordService } from '../../../auth/domain/services/password.service';
import { ChangePasswordInput } from '../dtos/change-password.input';

@Injectable()
export class ChangePasswordUseCase {
    private readonly logger = new Logger(ChangePasswordUseCase.name);

    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
        private readonly passwordService: PasswordService,
    ) { }

    async execute(userId: string, input: ChangePasswordInput): Promise<void> {
        this.logger.log(`Attempting to change password for user: ${userId}`);

        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        // Verify old password
        const isPasswordValid = await this.passwordService.compare(input.oldPassword, user.password);

        if (!isPasswordValid) {
            this.logger.warn(`Invalid old password for user: ${userId}`);
            throw new UnauthorizedException('Senha atual incorreta');
        }

        // Hash new password
        const hashedPassword = await this.passwordService.hash(input.newPassword);

        // Update user
        await this.userRepository.update(userId, {
            password: hashedPassword,
        });

        this.logger.log(`Password changed successfully for user: ${userId}`);
    }
}
