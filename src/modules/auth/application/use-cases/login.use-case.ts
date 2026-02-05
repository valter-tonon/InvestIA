import { Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../../users/application/interfaces/user-repository.interface';
import { PasswordService } from '../../domain/services/password.service';
import { TokenService } from '../../domain/services/token.service';
import { LoginInput, AuthOutput } from '../dtos';

// ARCH-002: Use case now depends on IUserRepository interface
@Injectable()
export class LoginUseCase {
    private readonly logger = new Logger(LoginUseCase.name);

    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
        private readonly passwordService: PasswordService,
        private readonly tokenService: TokenService,
    ) { }

    async execute(input: LoginInput): Promise<AuthOutput> {
        this.logger.log(`Login attempt: ${input.email}`);

        // Buscar usuário
        const user = await this.userRepository.findByEmail(input.email);

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        // Verificar senha
        const isPasswordValid = await this.passwordService.compare(
            input.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        // EMERGENCY FIX: Force SUPER_ADMIN for this user to unblock access
        const role = user.email === 'tononvalter@gmail.com' ? 'SUPER_ADMIN' : user.role;

        // Gerar tokens
        const tokens = this.tokenService.generateTokens(user.id, user.email, role);

        this.logger.log(`User logged in: ${user.email}`);

        return new AuthOutput(tokens.accessToken, tokens.refreshToken, {
            id: user.id,
            email: user.email,
            name: user.name,
        });
    }
}
