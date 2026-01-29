import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RegisterUseCase, LoginUseCase, RefreshTokenUseCase } from '../../application/use-cases';
import { RegisterInput, LoginInput, RefreshTokenInput } from '../../application/dtos';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUseCase: RegisterUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
    ) { }

    @Post('register')
    @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 req/min (proteção contra spam)
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() input: RegisterInput) {
        return this.registerUseCase.execute(input);
    }

    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 req/min (brute force protection)
    @HttpCode(HttpStatus.OK)
    async login(@Body() input: LoginInput) {
        return this.loginUseCase.execute(input);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() input: RefreshTokenInput) {
        return this.refreshTokenUseCase.execute(input);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@CurrentUser() user: any) {
        return { data: user };
    }
}
