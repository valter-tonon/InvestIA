import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { UsersModule } from '../users/users.module';
import { PasswordService } from './domain/services/password.service';
import { TokenService } from './domain/services/token.service';
import { RegisterUseCase, LoginUseCase, RefreshTokenUseCase } from './application/use-cases';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { AuthController } from './infrastructure/controllers/auth.controller';

// ARCH-002: Make AuthModule global so JwtAuthGuard is available everywhere without circular dependencies
@Global()
@Module({
    imports: [
        DatabaseModule,
        UsersModule, // ARCH-002: Import to access IUserRepository
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get('JWT_ACCESS_EXPIRATION'),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        PasswordService,
        TokenService,
        RegisterUseCase,
        LoginUseCase,
        RefreshTokenUseCase,
        JwtStrategy,
        JwtAuthGuard, // ARCH-002: Add guard to providers
    ],
    exports: [JwtStrategy, JwtAuthGuard, PassportModule], // ARCH-002: Export guard for use in other modules
})
export class AuthModule { }
