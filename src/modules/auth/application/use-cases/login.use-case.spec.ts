import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.use-case';
import { IUserRepository } from '../../../users/application/interfaces/user-repository.interface';
import { PasswordService } from '../../domain/services/password.service';
import { TokenService } from '../../domain/services/token.service';
import { UserEntity } from '../../../users/domain/entities/user.entity';

describe('LoginUseCase', () => {
    let useCase: LoginUseCase;
    let userRepository: jest.Mocked<IUserRepository>;
    let passwordService: jest.Mocked<PasswordService>;
    let tokenService: jest.Mocked<TokenService>;

    beforeEach(async () => {
        const mockUserRepository = {
            findByEmail: jest.fn(),
        };

        const mockPasswordService = {
            compare: jest.fn(),
        };

        const mockTokenService = {
            generateTokens: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoginUseCase,
                {
                    provide: 'IUserRepository',
                    useValue: mockUserRepository,
                },
                {
                    provide: PasswordService,
                    useValue: mockPasswordService,
                },
                {
                    provide: TokenService,
                    useValue: mockTokenService,
                },
            ],
        }).compile();

        useCase = module.get<LoginUseCase>(LoginUseCase);
        userRepository = module.get('IUserRepository');
        passwordService = module.get(PasswordService);
        tokenService = module.get(TokenService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should login successfully with valid credentials', async () => {
            // Arrange
            const input = {
                email: 'test@example.com',
                password: 'password123',
            };

            const userEntity = new UserEntity({
                id: 'uuid-123',
                email: input.email,
                name: 'Test User',
                password: 'hashed-password',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const tokens = {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            };

            userRepository.findByEmail.mockResolvedValue(userEntity);
            passwordService.compare.mockResolvedValue(true);
            tokenService.generateTokens.mockReturnValue(tokens);

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(result.accessToken).toBe(tokens.accessToken);
            expect(result.user.id).toBe(userEntity.id);
            expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
            expect(passwordService.compare).toHaveBeenCalledWith(input.password, userEntity.password);
            expect(tokenService.generateTokens).toHaveBeenCalledWith(userEntity.id, userEntity.email);
        });

        it('should throw UnauthorizedException when user not found', async () => {
            // Arrange
            const input = {
                email: 'non-existent@example.com',
                password: 'password123',
            };

            userRepository.findByEmail.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(UnauthorizedException);
            expect(passwordService.compare).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when password is invalid', async () => {
            // Arrange
            const input = {
                email: 'test@example.com',
                password: 'wrong-password',
            };

            const userEntity = new UserEntity({
                id: 'uuid-123',
                email: input.email,
                name: 'Test User',
                password: 'hashed-password',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            userRepository.findByEmail.mockResolvedValue(userEntity);
            passwordService.compare.mockResolvedValue(false);

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(UnauthorizedException);
        });
    });
});
