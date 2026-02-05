import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindAssetUseCase } from './find-asset.use-case';
import { IAssetRepository } from '../interfaces/asset-repository.interface';
import { AssetEntity } from '../../domain/entities/asset.entity';
import { AssetType } from '../../domain/enums/asset-type.enum';

describe('FindAssetUseCase', () => {
    let useCase: FindAssetUseCase;
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
                FindAssetUseCase,
                {
                    provide: 'IAssetRepository',
                    useValue: mockAssetRepository,
                },
            ],
        }).compile();

        useCase = module.get<FindAssetUseCase>(FindAssetUseCase);
        assetRepository = module.get('IAssetRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return asset when found', async () => {
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

            // Act
            const result = await useCase.execute(assetId);

            // Assert
            expect(result.id).toBe(assetId);
            expect(result.ticker).toBe(assetEntity.ticker);
            expect(assetRepository.findById).toHaveBeenCalledWith(assetId);
        });

        it('should throw NotFoundException when asset not found', async () => {
            // Arrange
            const assetId = 'non-existent-id';
            assetRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(assetId)).rejects.toThrow(NotFoundException);
        });
    });
});
