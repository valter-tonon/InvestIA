import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateAssetUseCase } from './update-asset.use-case';
import { IAssetRepository } from '../interfaces/asset-repository.interface';
import { AssetEntity } from '../../domain/entities/asset.entity';
import { AssetType } from '../../domain/enums/asset-type.enum';

describe('UpdateAssetUseCase', () => {
    let useCase: UpdateAssetUseCase;
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
                UpdateAssetUseCase,
                {
                    provide: 'IAssetRepository',
                    useValue: mockAssetRepository,
                },
            ],
        }).compile();

        useCase = module.get<UpdateAssetUseCase>(UpdateAssetUseCase);
        assetRepository = module.get('IAssetRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should update asset when exists', async () => {
            // Arrange
            const assetId = 'uuid-123';
            const input = {
                name: 'Petrobras Preferencial',
                type: AssetType.STOCK,
                sector: 'Energia',
            };

            const existingAsset = new AssetEntity({
                id: assetId,
                ticker: 'PETR4',
                name: 'Petrobras',
                type: AssetType.STOCK,
                sector: 'Oil',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const updatedAsset = new AssetEntity({
                ...existingAsset,
                name: input.name,
                sector: input.sector,
                updatedAt: new Date()
            });

            assetRepository.findById.mockResolvedValue(existingAsset);
            assetRepository.update.mockResolvedValue(updatedAsset);

            // Act
            const result = await useCase.execute(assetId, input);

            // Assert
            expect(result.id).toBe(assetId);
            expect(result.name).toBe(input.name);
            expect(result.sector).toBe(input.sector);
            expect(assetRepository.findById).toHaveBeenCalledWith(assetId);
            expect(assetRepository.update).toHaveBeenCalledWith(assetId, expect.objectContaining({
                name: input.name,
                sector: input.sector
            }));
        });

        it('should throw NotFoundException when asset not found', async () => {
            // Arrange
            const assetId = 'non-existent-id';
            const input = { name: 'New Name' };

            assetRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(assetId, input)).rejects.toThrow(NotFoundException);
            expect(assetRepository.update).not.toHaveBeenCalled();
        });
    });
});
