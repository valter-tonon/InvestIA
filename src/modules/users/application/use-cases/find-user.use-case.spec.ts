import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindUserUseCase } from './find-user.use-case';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

describe('FindUserUseCase', () => {
    let useCase: FindUserUseCase;
    let userRepository: jest.Mocked<IUserRepository>;

    beforeEach(async () => {
        const mockUserRepository = {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FindUserUseCase,
                {
                    provide: 'IUserRepository',
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        useCase = module.get<FindUserUseCase>(FindUserUseCase);
        userRepository = module.get('IUserRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return user when found', async () => {
            // Arrange
            const userId = 'uuid-123';
            const userEntity = new UserEntity({
                id: userId,
                email: 'test@example.com',
                name: 'Test User',
                password: 'password',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            userRepository.findById.mockResolvedValue(userEntity);

            // Act
            const result = await useCase.execute(userId);

            // Assert
            expect(result.id).toBe(userId);
            expect(result.email).toBe(userEntity.email);
            expect(userRepository.findById).toHaveBeenCalledWith(userId);
        });

        it('should throw NotFoundException when user not found', async () => {
            // Arrange
            const userId = 'non-existent-id';
            userRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
            expect(userRepository.findById).toHaveBeenCalledWith(userId);
        });
    });
});
