import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PasswordService } from '../../domain/services/password.service';
import { TokenService } from '../../domain/services/token.service';
import { LoginInput, AuthOutput } from '../dtos';

@Injectable()
export class LoginUseCase {
    private readonly logger = new Logger(LoginUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly passwordService: PasswordService,
        private readonly tokenService: TokenService,
    ) { }

    async execute(input: LoginInput): Promise<AuthOutput> {
        this.logger.log(`Login attempt: ${input.email}`);

        // Buscar usuário
        const user = await this.prisma.user.findUnique({
            where: { email: input.email },
        });

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

        // Gerar tokens
        const tokens = this.tokenService.generateTokens(user.id, user.email);

        this.logger.log(`User logged in: ${user.email}`);

        return new AuthOutput(tokens.accessToken, tokens.refreshToken, {
            id: user.id,
            email: user.email,
            name: user.name,
        });
    }
}
