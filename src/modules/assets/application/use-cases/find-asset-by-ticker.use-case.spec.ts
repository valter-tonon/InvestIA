import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindAssetByTickerUseCase } from './find-asset-by-ticker.use-case';
import { IAssetRepository } from '../interfaces/asset-repository.interface';
import { AssetEntity } from '../../domain/entities/asset.entity';
import { AssetType } from '../../domain/enums/asset-type.enum';

describe('FindAssetByTickerUseCase', () => {
    let useCase: FindAssetByTickerUseCase;
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
                FindAssetByTickerUseCase,
                {
                    provide: 'IAssetRepository',
                    useValue: mockAssetRepository,
                },
            ],
        }).compile();

        useCase = module.get<FindAssetByTickerUseCase>(FindAssetByTickerUseCase);
        assetRepository = module.get('IAssetRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return asset when found by ticker', async () => {
            // Arrange
            const ticker = 'PETR4';
            const assetEntity = new AssetEntity({
                id: 'uuid-123',
                ticker: ticker,
                name: 'Petrobras',
                type: AssetType.STOCK,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            assetRepository.findByTicker.mockResolvedValue(assetEntity);

            // Act
            const result = await useCase.execute(ticker);

            // Assert
            expect(result.id).toBe(assetEntity.id);
            expect(result.ticker).toBe(ticker);
            expect(assetRepository.findByTicker).toHaveBeenCalledWith(ticker);
        });

        it('should throw NotFoundException when asset not found', async () => {
            // Arrange
            const ticker = 'INVALID';
            assetRepository.findByTicker.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(ticker)).rejects.toThrow(NotFoundException);
        });
    });
});
