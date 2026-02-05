import { Test, TestingModule } from '@nestjs/testing';
import { PhilosophiesController } from './philosophies.controller';
import { UploadPhilosophyUseCase, ListPhilosophiesUseCase, DeletePhilosophyUseCase } from '../../application/use-cases';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

describe('PhilosophiesController', () => {
    let controller: PhilosophiesController;
    let uploadPhilosophyUseCase: jest.Mocked<UploadPhilosophyUseCase>;
    let listPhilosophiesUseCase: jest.Mocked<ListPhilosophiesUseCase>;
    let deletePhilosophyUseCase: jest.Mocked<DeletePhilosophyUseCase>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PhilosophiesController],
            imports: [ThrottlerModule.forRoot([{ limit: 10, ttl: 60 }])],
            providers: [
                { provide: UploadPhilosophyUseCase, useValue: { execute: jest.fn() } },
                { provide: ListPhilosophiesUseCase, useValue: { execute: jest.fn() } },
                { provide: DeletePhilosophyUseCase, useValue: { execute: jest.fn() } },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(ThrottlerGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<PhilosophiesController>(PhilosophiesController);
        uploadPhilosophyUseCase = module.get(UploadPhilosophyUseCase);
        listPhilosophiesUseCase = module.get(ListPhilosophiesUseCase);
        deletePhilosophyUseCase = module.get(DeletePhilosophyUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    const mockUser = { id: 'user-123' };

    describe('upload', () => {
        it('should call UploadPhilosophyUseCase', async () => {
            const input = { title: 'Test', description: 'Desc' };
            const file = { originalname: 'test.pdf' } as Express.Multer.File;
            const output = { id: '1', ...input };
            uploadPhilosophyUseCase.execute.mockResolvedValue(output as any);

            const result = await controller.upload(mockUser, input, file);

            expect(uploadPhilosophyUseCase.execute).toHaveBeenCalledWith('user-123', input, file);
            expect(result).toEqual(output);
        });
    });

    describe('list', () => {
        it('should call ListPhilosophiesUseCase', async () => {
            const output = [{ id: '1', title: 'Test' }];
            listPhilosophiesUseCase.execute.mockResolvedValue(output as any);

            const result = await controller.list(mockUser);

            expect(listPhilosophiesUseCase.execute).toHaveBeenCalledWith('user-123');
            expect(result).toEqual(output);
        });
    });

    describe('delete', () => {
        it('should call DeletePhilosophyUseCase', async () => {
            const id = 'phil-123';
            deletePhilosophyUseCase.execute.mockResolvedValue(undefined);

            await controller.delete(mockUser, id);

            expect(deletePhilosophyUseCase.execute).toHaveBeenCalledWith('user-123', id);
        });
    });
});
