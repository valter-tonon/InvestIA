import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DeletePhilosophyUseCase } from './delete-philosophy.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('fs/promises');

describe('DeletePhilosophyUseCase', () => {
    let useCase: DeletePhilosophyUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrismaService = {
            philosophy: {
                findUnique: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeletePhilosophyUseCase,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        useCase = module.get<DeletePhilosophyUseCase>(DeletePhilosophyUseCase);
        prismaService = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const userId = 'user-123';
        const philosophyId = 'phil-123';
        const validPath = path.join(process.cwd(), 'uploads', 'philosophies', 'file.pdf');

        it('should delete philosophy and file successfully', async () => {
            // Arrange
            const philosophy = {
                id: philosophyId,
                userId: userId,
                filePath: validPath,
            };
            prismaService.philosophy.findUnique.mockResolvedValue(philosophy as any);
            (fs.unlink as jest.Mock).mockResolvedValue(undefined);

            // Act
            await useCase.execute(userId, philosophyId);

            // Assert
            expect(prismaService.philosophy.delete).toHaveBeenCalledWith({ where: { id: philosophyId } });
            expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining('file.pdf'));
        });

        it('should throw NotFoundException if philosophy does not exist', async () => {
            prismaService.philosophy.findUnique.mockResolvedValue(null);

            await expect(useCase.execute(userId, philosophyId)).rejects.toThrow(NotFoundException);
            expect(prismaService.philosophy.delete).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if user does not own philosophy', async () => {
            const philosophy = {
                id: philosophyId,
                userId: 'other-user',
                filePath: validPath,
            };
            prismaService.philosophy.findUnique.mockResolvedValue(philosophy as any);

            await expect(useCase.execute(userId, philosophyId)).rejects.toThrow(NotFoundException);
            expect(prismaService.philosophy.delete).not.toHaveBeenCalled();
        });

        it('should handle file deletion error gracefully', async () => {
            const philosophy = {
                id: philosophyId,
                userId: userId,
                filePath: validPath,
            };
            prismaService.philosophy.findUnique.mockResolvedValue(philosophy as any);
            (fs.unlink as jest.Mock).mockRejectedValue(new Error('File not found'));

            // Act (should not throw)
            await useCase.execute(userId, philosophyId);

            // Assert
            expect(prismaService.philosophy.delete).toHaveBeenCalled();
            expect(fs.unlink).toHaveBeenCalled();
        });
    });
});
