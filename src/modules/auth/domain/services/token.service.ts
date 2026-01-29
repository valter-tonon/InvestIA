import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface TokenPayload {
    sub: string;
    email: string;
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

    generateTokens(userId: string, email: string): AuthTokens {
        const payload: TokenPayload = { sub: userId, email };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
        });

        return { accessToken, refreshToken };
    }

    async verifyToken(token: string): Promise<TokenPayload> {
        return this.jwtService.verifyAsync(token, {
            secret: this.configService.get('JWT_SECRET'),
        });
    }
}
