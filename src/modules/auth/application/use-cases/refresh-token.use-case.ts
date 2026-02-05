import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { TokenService } from '../../domain/services/token.service';
import { RefreshTokenInput } from '../dtos';

@Injectable()
export class RefreshTokenUseCase {
    private readonly logger = new Logger(RefreshTokenUseCase.name);

    constructor(private readonly tokenService: TokenService) { }

    async execute(input: RefreshTokenInput): Promise<{ accessToken: string }> {
        this.logger.log('Refreshing access token');

        try {
            // Validar refresh token
            // SEC-017: Verify refresh token with appropriate secret
            const payload = await this.tokenService.verifyToken(input.refreshToken, true);

            // Gerar novo access token
            const tokens = this.tokenService.generateTokens(payload.sub, payload.email);

            return { accessToken: tokens.accessToken };
        } catch (error) {
            throw new UnauthorizedException('Refresh token inválido ou expirado');
        }
    }
}
