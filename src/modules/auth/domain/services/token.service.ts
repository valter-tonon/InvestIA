import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface TokenPayload {
    sub: string;
    email: string;
    role?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    generateTokens(userId: string, email: string, role?: string): AuthTokens {
        const payload: TokenPayload = { sub: userId, email, role };

        // SEC-017: Use separate secrets for access and refresh tokens
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET') || this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET') || this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
        });

        return { accessToken, refreshToken };
    }

    async verifyToken(token: string, isRefreshToken: boolean = false): Promise<TokenPayload> {
        // SEC-017: Use appropriate secret based on token type
        const secret = isRefreshToken
            ? this.configService.get('JWT_REFRESH_SECRET') || this.configService.get('JWT_SECRET')
            : this.configService.get('JWT_ACCESS_SECRET') || this.configService.get('JWT_SECRET');

        return this.jwtService.verifyAsync(token, { secret });
    }
}
