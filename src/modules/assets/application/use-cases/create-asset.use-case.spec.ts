import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateAssetUseCase } from './create-asset.use-case';
import { AssetType } from '../../domain/enums/asset-type.enum';
import { IAssetRepository } from '../interfaces/asset-repository.interface';
import { AssetEntity } from '../../domain/entities/asset.entity';

describe('CreateAssetUseCase', () => {
    let useCase: CreateAssetUseCase;
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
                CreateAssetUseCase,
                {
                    provide: 'IAssetRepository',
                    useValue: mockAssetRepository,
                },
            ],
        }).compile();

        useCase = module.get<CreateAssetUseCase>(CreateAssetUseCase);
        assetRepository = module.get('IAssetRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should create asset successfully when ticker is unique', async () => {
            // Arrange
            const input = {
                ticker: 'PETR4',
                name: 'Petrobras PN',
                type: AssetType.STOCK,
                sector: 'Energia',
            };
            const createdAsset = new AssetEntity({
                id: 'uuid-123',
                ticker: input.ticker,
                name: input.name,
                type: input.type,
                sector: input.sector,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            assetRepository.findByTicker.mockResolvedValue(null);
            assetRepository.create.mockResolvedValue(createdAsset);

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(result.ticker).toBe(input.ticker);
            expect(result.name).toBe(input.name);
            expect(result.type).toBe(input.type);
            expect(assetRepository.findByTicker).toHaveBeenCalledWith(input.ticker);
            expect(assetRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                ticker: input.ticker,
                name: input.name,
                type: input.type,
            }));
        });

        it('should throw ConflictException when ticker already exists', async () => {
            // Arrange
            const input = {
                ticker: 'PETR4',
                name: 'Petrobras PN',
                type: AssetType.STOCK,
            };
            const existingAsset = new AssetEntity({
                id: 'uuid-456',
                ticker: input.ticker,
                name: 'Existing',
                type: AssetType.STOCK,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            assetRepository.findByTicker.mockResolvedValue(existingAsset);

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(ConflictException);
            expect(assetRepository.create).not.toHaveBeenCalled();
        });
    });
});
