import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PasswordService } from '../../domain/services/password.service';
import { TokenService } from '../../domain/services/token.service';
import { RegisterInput, AuthOutput } from '../dtos';

@Injectable()
export class RegisterUseCase {
    private readonly logger = new Logger(RegisterUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly passwordService: PasswordService,
        private readonly tokenService: TokenService,
    ) { }

    async execute(input: RegisterInput): Promise<AuthOutput> {
        this.logger.log(`Registering user: ${input.email}`);

        // Verificar se email já existe
        const existingUser = await this.prisma.user.findUnique({
            where: { email: input.email },
        });

        if (existingUser) {
            throw new ConflictException('Email já está cadastrado');
        }

        // Hash da senha
        const hashedPassword = await this.passwordService.hash(input.password);

        // Criar usuário
        const user = await this.prisma.user.create({
            data: {
                email: input.email,
                password: hashedPassword,
                name: input.name,
            },
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
