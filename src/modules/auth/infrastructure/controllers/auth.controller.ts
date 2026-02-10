import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Res, ForbiddenException, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { RegisterUseCase, LoginUseCase, RefreshTokenUseCase } from '../../application/use-cases';
import { RegisterInput, LoginInput, RefreshTokenInput } from '../../application/dtos';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { IUserRepository } from '../../../users/application/interfaces/user-repository.interface';
import { UserOutput } from '../../../users/application/dtos';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUseCase: RegisterUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) { }

    @Post('register')
    @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 req/min (proteção contra spam)
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() input: RegisterInput,
        @Res({ passthrough: true }) response: Response,
    ) {
        throw new ForbiddenException('Novos cadastros estão temporariamente desabilitados.');

        const result = await this.registerUseCase.execute(input);

        // SEC-005: Set HttpOnly cookies
        this.setAuthCookies(response, result.accessToken, result.refreshToken);

        return {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        };
    }

    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 req/min (brute force protection)
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() input: LoginInput,
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.loginUseCase.execute(input);

        // SEC-005: Set HttpOnly cookies
        this.setAuthCookies(response, result.accessToken, result.refreshToken);

        return {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        };
    }

    @Post('refresh')
    @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 req/min (prevent refresh token brute force)
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Body() input: RefreshTokenInput,
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.refreshTokenUseCase.execute(input);

        // SEC-005: Set new access token cookie
        response.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        return { success: true };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    async getMe(@CurrentUser() currentUser: { id: string }) {
        // Buscar dados atualizados do usuário no banco de dados para incluir avatar e role
        const user = await this.userRepository.findById(currentUser.id);
        if (!user) {
            throw new ForbiddenException('Usuário não encontrado');
        }
        return { data: UserOutput.fromEntity(user) };
    }

    // SEC-005: Logout endpoint to clear cookies
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('access_token');
        response.clearCookie('refresh_token');
        return { success: true };
    }

    // SEC-005: Helper method to set auth cookies
    private setAuthCookies(response: Response, accessToken: string, refreshToken: string) {
        const isProduction = process.env.NODE_ENV === 'production';

        response.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
}
