import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserUseCase } from './update-user.use-case';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

describe('UpdateUserUseCase', () => {
    let useCase: UpdateUserUseCase;
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
                UpdateUserUseCase,
                {
                    provide: 'IUserRepository',
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
        userRepository = module.get('IUserRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should update user name when user exists', async () => {
            // Arrange
            const userId = 'uuid-123';
            const input = { name: 'Updated Name' };

            const existingUser = new UserEntity({
                id: userId,
                email: 'test@example.com',
                name: 'Old Name',
                password: 'password',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const updatedUser = new UserEntity({
                ...existingUser,
                name: input.name,
                updatedAt: new Date()
            });

            userRepository.findById.mockResolvedValue(existingUser);
            userRepository.update.mockResolvedValue(updatedUser);

            // Act
            const result = await useCase.execute(userId, input);

            // Assert
            expect(result.id).toBe(userId);
            expect(result.name).toBe(input.name);
            expect(userRepository.findById).toHaveBeenCalledWith(userId);
            expect(userRepository.update).toHaveBeenCalledWith(userId, { name: input.name });
        });

        it('should throw NotFoundException when user not found', async () => {
            // Arrange
            const userId = 'non-existent-id';
            const input = { name: 'Updated Name' };

            userRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(userId, input)).rejects.toThrow(NotFoundException);
            expect(userRepository.update).not.toHaveBeenCalled();
        });
    });
});
