import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import {
    CreateUserUseCase,
    FindUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
} from '../../application/use-cases';
import { ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

describe('UsersController', () => {
    let controller: UsersController;
    let createUserUseCase: jest.Mocked<CreateUserUseCase>;
    let findUserUseCase: jest.Mocked<FindUserUseCase>;
    let listUsersUseCase: jest.Mocked<ListUsersUseCase>;
    let updateUserUseCase: jest.Mocked<UpdateUserUseCase>;
    let deleteUserUseCase: jest.Mocked<DeleteUserUseCase>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: CreateUserUseCase,
                    useValue: { execute: jest.fn() },
                },
                {
                    provide: FindUserUseCase,
                    useValue: { execute: jest.fn() },
                },
                {
                    provide: ListUsersUseCase,
                    useValue: { execute: jest.fn() },
                },
                {
                    provide: UpdateUserUseCase,
                    useValue: { execute: jest.fn() },
                },
                {
                    provide: DeleteUserUseCase,
                    useValue: { execute: jest.fn() },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<UsersController>(UsersController);
        createUserUseCase = module.get(CreateUserUseCase);
        findUserUseCase = module.get(FindUserUseCase);
        listUsersUseCase = module.get(ListUsersUseCase);
        updateUserUseCase = module.get(UpdateUserUseCase);
        deleteUserUseCase = module.get(DeleteUserUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call CreateUserUseCase', async () => {
            const input = { name: 'Test', email: 'test@test.com', password: '123' };
            const output = { id: '1', ...input, createdAt: new Date() };
            createUserUseCase.execute.mockResolvedValue(output as any);

            const result = await controller.create(input);

            expect(createUserUseCase.execute).toHaveBeenCalledWith(input);
            expect(result).toEqual({ data: output });
        });
    });

    describe('list', () => {
        it('should call ListUsersUseCase with pagination', async () => {
            const output = { data: [], meta: { total: 0, page: 1, lastPage: 1 } };
            listUsersUseCase.execute.mockResolvedValue(output as any);

            await controller.list('1', '10');

            expect(listUsersUseCase.execute).toHaveBeenCalledWith({ page: 1, perPage: 10 });
        });

        it('should use default pagination values', async () => {
            const output = { data: [], meta: { total: 0, page: 1, lastPage: 1 } };
            listUsersUseCase.execute.mockResolvedValue(output as any);

            await controller.list(undefined, undefined);

            expect(listUsersUseCase.execute).toHaveBeenCalledWith({ page: 1, perPage: 20 });
        });
    });

    describe('findOne', () => {
        it('should call FindUserUseCase', async () => {
            const id = 'uuid';
            const output = { id, name: 'Test' };
            findUserUseCase.execute.mockResolvedValue(output as any);

            const result = await controller.findOne(id);

            expect(findUserUseCase.execute).toHaveBeenCalledWith(id);
            expect(result).toEqual({ data: output });
        });
    });

    describe('update', () => {
        it('should call UpdateUserUseCase when user updates own profile', async () => {
            const id = 'uuid';
            const input = { name: 'Updated' };
            const user = { id: 'uuid' }; // Same ID
            const output = { id, ...input };
            updateUserUseCase.execute.mockResolvedValue(output as any);

            const result = await controller.update(id, input, user);

            expect(updateUserUseCase.execute).toHaveBeenCalledWith(id, input);
            expect(result).toEqual({ data: output });
        });

        it('should throw ForbiddenException when user updates another profile', async () => {
            const id = 'uuid';
            const input = { name: 'Updated' };
            const user = { id: 'other-uuid' }; // Different ID

            await expect(controller.update(id, input, user)).rejects.toThrow(ForbiddenException);
            expect(updateUserUseCase.execute).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should call DeleteUserUseCase when user deletes own account', async () => {
            const id = 'uuid';
            const user = { id: 'uuid' }; // Same ID

            await controller.delete(id, user);

            expect(deleteUserUseCase.execute).toHaveBeenCalledWith(id);
        });

        it('should throw ForbiddenException when user deletes another account', async () => {
            const id = 'uuid';
            const user = { id: 'other-uuid' }; // Different ID

            await expect(controller.delete(id, user)).rejects.toThrow(ForbiddenException);
            expect(deleteUserUseCase.execute).not.toHaveBeenCalled();
        });
    });
});
