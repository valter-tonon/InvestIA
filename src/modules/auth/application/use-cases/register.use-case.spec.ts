import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUseCase } from './register.use-case';
import { IUserRepository } from '../../../users/application/interfaces/user-repository.interface';
import { PasswordService } from '../../domain/services/password.service';
import { TokenService } from '../../domain/services/token.service';
import { UserEntity } from '../../../users/domain/entities/user.entity';

describe('RegisterUseCase', () => {
    let useCase: RegisterUseCase;
    let userRepository: jest.Mocked<IUserRepository>;
    let passwordService: jest.Mocked<PasswordService>;
    let tokenService: jest.Mocked<TokenService>;

    beforeEach(async () => {
        const mockUserRepository = {
            findByEmail: jest.fn(),
            create: jest.fn(),
        };

        const mockPasswordService = {
            hash: jest.fn(),
        };

        const mockTokenService = {
            generateTokens: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RegisterUseCase,
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

        useCase = module.get<RegisterUseCase>(RegisterUseCase);
        userRepository = module.get('IUserRepository');
        passwordService = module.get(PasswordService);
        tokenService = module.get(TokenService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should register user successfully', async () => {
            // Arrange
            const input = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            };

            const userEntity = new UserEntity({
                id: 'uuid-123',
                email: input.email,
                name: input.name,
                password: 'hashed-password',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const tokens = {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            };

            userRepository.findByEmail.mockResolvedValue(null);
            passwordService.hash.mockResolvedValue('hashed-password');
            userRepository.create.mockResolvedValue(userEntity);
            tokenService.generateTokens.mockReturnValue(tokens);

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(result.accessToken).toBe(tokens.accessToken);
            expect(result.user.email).toBe(input.email);
            expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
            expect(passwordService.hash).toHaveBeenCalledWith(input.password);
            expect(userRepository.create).toHaveBeenCalled();
            expect(tokenService.generateTokens).toHaveBeenCalledWith(userEntity.id, userEntity.email);
        });

        it('should throw ConflictException when email already exists', async () => {
            // Arrange
            const input = {
                name: 'Test User',
                email: 'existing@example.com',
                password: 'password123',
            };

            const existingUser = new UserEntity({
                id: 'uuid-456',
                email: input.email,
                name: 'Existing',
                password: 'pass',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            userRepository.findByEmail.mockResolvedValue(existingUser);

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(ConflictException);
            expect(userRepository.create).not.toHaveBeenCalled();
        });
    });
});
