import { Test, TestingModule } from '@nestjs/testing';
import { ListAssetsUseCase } from './list-assets.use-case';
import { IAssetRepository } from '../interfaces/asset-repository.interface';
import { AssetEntity } from '../../domain/entities/asset.entity';
import { AssetType } from '../../domain/enums/asset-type.enum';

describe('ListAssetsUseCase', () => {
    let useCase: ListAssetsUseCase;
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
                ListAssetsUseCase,
                {
                    provide: 'IAssetRepository',
                    useValue: mockAssetRepository,
                },
            ],
        }).compile();

        useCase = module.get<ListAssetsUseCase>(ListAssetsUseCase);
        assetRepository = module.get('IAssetRepository');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return paginated assets', async () => {
            // Arrange
            const assets = [
                new AssetEntity({ id: '1', ticker: 'A', name: 'A', type: AssetType.STOCK, createdAt: new Date(), updatedAt: new Date() }),
                new AssetEntity({ id: '2', ticker: 'B', name: 'B', type: AssetType.STOCK, createdAt: new Date(), updatedAt: new Date() }),
            ];

            assetRepository.findAll.mockResolvedValue(assets);
            assetRepository.count.mockResolvedValue(2);

            // Act
            const result = await useCase.execute({});

            // Assert
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
            expect(assetRepository.findAll).toHaveBeenCalled();
        });

        it('should apply filters', async () => {
            // Arrange
            const filter = { type: AssetType.FII, sector: 'Real Estate' };
            assetRepository.findAll.mockResolvedValue([]);
            assetRepository.count.mockResolvedValue(0);

            // Act
            await useCase.execute(filter);

            // Assert
            expect(assetRepository.findAll).toHaveBeenCalledWith(expect.anything(), expect.anything(), filter);
            expect(assetRepository.count).toHaveBeenCalledWith(filter);
        });
    });
});
