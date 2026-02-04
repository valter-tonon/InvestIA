import { Test, TestingModule } from '@nestjs/testing';
import { GoneException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository } from '../interfaces/user-repository.interface';

describe('CreateUserUseCase', () => {
    let useCase: CreateUserUseCase;
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
                CreateUserUseCase,
                {
                    provide: 'IUserRepository',
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
        userRepository = module.get('IUserRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should throw GoneException (Deprecated)', async () => {
            const input = { email: 'any@test.com', name: 'Any', password: '123' };
            await expect(useCase.execute(input)).rejects.toThrow(GoneException);
        });
    });
});
