import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteAssetUseCase } from './delete-asset.use-case';
import { IAssetRepository } from '../interfaces/asset-repository.interface';
import { AssetEntity } from '../../domain/entities/asset.entity';
import { AssetType } from '../../domain/enums/asset-type.enum';

describe('DeleteAssetUseCase', () => {
    let useCase: DeleteAssetUseCase;
    let assetRepository: jest.Mocked<IAssetRepository>;

    beforeEach(async () => {
        const mockAssetRepository = {
            create: jest.fn(),
            findByTicker: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            findByType: jest.fn(),
            findBySector: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteAssetUseCase,
                {
                    provide: 'IAssetRepository',
                    useValue: mockAssetRepository,
                },
            ],
        }).compile();

        useCase = module.get<DeleteAssetUseCase>(DeleteAssetUseCase);
        assetRepository = module.get('IAssetRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should delete asset when found', async () => {
            // Arrange
            const assetId = 'uuid-123';
            const assetEntity = new AssetEntity({
                id: assetId,
                ticker: 'PETR4',
                name: 'Petrobras',
                type: AssetType.STOCK,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            assetRepository.findById.mockResolvedValue(assetEntity);
            assetRepository.delete.mockResolvedValue(undefined);

            // Act
            await useCase.execute(assetId);

            // Assert
            expect(assetRepository.findById).toHaveBeenCalledWith(assetId);
            expect(assetRepository.delete).toHaveBeenCalledWith(assetId);
        });

        it('should throw NotFoundException when asset not found', async () => {
            // Arrange
            const assetId = 'non-existent-id';
            assetRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(assetId)).rejects.toThrow(NotFoundException);
            expect(assetRepository.delete).not.toHaveBeenCalled();
        });
    });
});
