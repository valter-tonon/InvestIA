import { Injectable, ConflictException, Logger, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../../users/application/interfaces/user-repository.interface';
import { PasswordService } from '../../domain/services/password.service';
import { TokenService } from '../../domain/services/token.service';
import { RegisterInput, AuthOutput } from '../dtos';

// ARCH-002: Use case now depends on IUserRepository interface
@Injectable()
export class RegisterUseCase {
    private readonly logger = new Logger(RegisterUseCase.name);

    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
        private readonly passwordService: PasswordService,
        private readonly tokenService: TokenService,
    ) { }

    async execute(input: RegisterInput): Promise<AuthOutput> {
        this.logger.log(`Registering user: ${input.email}`);

        // Verificar se email já existe
        const existingUser = await this.userRepository.findByEmail(input.email);

        if (existingUser) {
            throw new ConflictException('Email já está cadastrado');
        }

        // Hash da senha
        const hashedPassword = await this.passwordService.hash(input.password);

        // Criar usuário
        const user = await this.userRepository.create({
            email: input.email,
            password: hashedPassword,
            name: input.name,
        });

        // Gerar tokens
        const tokens = this.tokenService.generateTokens(user.id, user.email);

        this.logger.log(`User registered: ${user.email}`);

        return new AuthOutput(tokens.accessToken, tokens.refreshToken, {
            id: user.id,
            email: user.email,
            name: user.name,
        });
    }
}
