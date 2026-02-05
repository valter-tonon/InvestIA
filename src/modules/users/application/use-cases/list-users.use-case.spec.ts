import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersUseCase } from './list-users.use-case';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

describe('ListUsersUseCase', () => {
    let useCase: ListUsersUseCase;
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
                ListUsersUseCase,
                {
                    provide: 'IUserRepository',
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
        userRepository = module.get('IUserRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return paginated users with default options', async () => {
            // Arrange
            const users = [
                new UserEntity({ id: 'uuid-1', email: 'user1@example.com', name: 'User 1', password: 'pass', createdAt: new Date(), updatedAt: new Date() }),
                new UserEntity({ id: 'uuid-2', email: 'user2@example.com', name: 'User 2', password: 'pass', createdAt: new Date(), updatedAt: new Date() }),
            ];

            userRepository.findAll.mockResolvedValue(users);
            userRepository.count.mockResolvedValue(2);

            // Act
            const result = await useCase.execute();

            // Assert
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
            expect(result.meta.page).toBe(1);
            expect(result.meta.perPage).toBe(20);
            expect(userRepository.findAll).toHaveBeenCalledWith(1, 20);
            expect(userRepository.count).toHaveBeenCalled();
        });

        it('should return empty list when no users exist', async () => {
            // Arrange
            userRepository.findAll.mockResolvedValue([]);
            userRepository.count.mockResolvedValue(0);

            // Act
            const result = await useCase.execute();

            // Assert
            expect(result.data).toHaveLength(0);
            expect(result.meta.total).toBe(0);
            expect(result.meta.lastPage).toBe(0);
        });

        it('should respect custom pagination options', async () => {
            // Arrange
            userRepository.findAll.mockResolvedValue([]);
            userRepository.count.mockResolvedValue(50);

            // Act
            const result = await useCase.execute({ page: 2, perPage: 10 });

            // Assert
            expect(result.meta.page).toBe(2);
            expect(result.meta.perPage).toBe(10);
            expect(result.meta.lastPage).toBe(5);
            expect(userRepository.findAll).toHaveBeenCalledWith(2, 10);
        });

        it('should limit perPage to maximum of 100', async () => {
            // Arrange
            userRepository.findAll.mockResolvedValue([]);
            userRepository.count.mockResolvedValue(0);

            // Act
            await useCase.execute({ perPage: 200 });

            // Assert
            expect(userRepository.findAll).toHaveBeenCalledWith(1, 100);
        });
    });
});
