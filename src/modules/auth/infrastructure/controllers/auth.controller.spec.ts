import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RegisterUseCase, LoginUseCase, RefreshTokenUseCase } from '../../application/use-cases';
import { RegisterInput, LoginInput, RefreshTokenInput } from '../../application/dtos';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Response } from 'express';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

describe('AuthController', () => {
    let controller: AuthController;
    let registerUseCase: jest.Mocked<RegisterUseCase>;
    let loginUseCase: jest.Mocked<LoginUseCase>;
    let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            imports: [ThrottlerModule.forRoot([{ limit: 10, ttl: 60 }])], // Mock throttler config
            providers: [
                {
                    provide: RegisterUseCase,
                    useValue: { execute: jest.fn() },
                },
                {
                    provide: LoginUseCase,
                    useValue: { execute: jest.fn() },
                },
                {
                    provide: RefreshTokenUseCase,
                    useValue: { execute: jest.fn() },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(ThrottlerGuard) // Mock ThrottlerGuard to allow requests
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<AuthController>(AuthController);
        registerUseCase = module.get(RegisterUseCase);
        loginUseCase = module.get(LoginUseCase);
        refreshTokenUseCase = module.get(RefreshTokenUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // Mock Express Response
    const mockResponse = () => {
        const res: Partial<Response> = {};
        res.cookie = jest.fn().mockReturnValue(res);
        res.clearCookie = jest.fn().mockReturnValue(res);
        return res as Response;
    };

    describe('register', () => {
        it('should call RegisterUseCase and set cookies', async () => {
            const input: RegisterInput = { email: 'test@test.com', password: '123', name: 'Test' };
            const output = {
                user: { id: '1', email: input.email },
                accessToken: 'access-token',
                refreshToken: 'refresh-token'
            };
            registerUseCase.execute.mockResolvedValue(output as any);
            const res = mockResponse();

            const result = await controller.register(input, res);

            expect(registerUseCase.execute).toHaveBeenCalledWith(input);
            expect(res.cookie).toHaveBeenCalledTimes(2); // Access and Refresh tokens
            expect(res.cookie).toHaveBeenCalledWith('access_token', 'access-token', expect.any(Object));
            expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh-token', expect.any(Object));
            expect(result).toEqual({ user: output.user });
        });
    });

    describe('login', () => {
        it('should call LoginUseCase and set cookies', async () => {
            const input: LoginInput = { email: 'test@test.com', password: '123' };
            const output = {
                user: { id: '1', email: input.email },
                accessToken: 'access-token',
                refreshToken: 'refresh-token'
            };
            loginUseCase.execute.mockResolvedValue(output as any);
            const res = mockResponse();

            const result = await controller.login(input, res);

            expect(loginUseCase.execute).toHaveBeenCalledWith(input);
            expect(res.cookie).toHaveBeenCalledTimes(2);
            expect(result).toEqual({ user: output.user });
        });
    });

    describe('refresh', () => {
        it('should call RefreshTokenUseCase and update access token cookie', async () => {
            const input: RefreshTokenInput = { refreshToken: 'old-refresh-token' };
            const output = { accessToken: 'new-access-token' };
            refreshTokenUseCase.execute.mockResolvedValue(output as any);
            const res = mockResponse();

            const result = await controller.refresh(input, res);

            expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(input);
            expect(res.cookie).toHaveBeenCalledTimes(1);
            expect(res.cookie).toHaveBeenCalledWith('access_token', 'new-access-token', expect.any(Object));
            expect(result).toEqual({ success: true });
        });
    });

    describe('logout', () => {
        it('should clear cookies', async () => {
            const res = mockResponse();

            const result = await controller.logout(res);

            expect(res.clearCookie).toHaveBeenCalledTimes(2);
            expect(res.clearCookie).toHaveBeenCalledWith('access_token');
            expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
            expect(result).toEqual({ success: true });
        });
    });

    describe('getMe', () => {
        it('should return current user data', async () => {
            const user = { id: '1', email: 'test@test.com', name: 'Test' };

            const result = await controller.getMe(user);

            expect(result).toEqual({ data: user });
        });
    });
});
