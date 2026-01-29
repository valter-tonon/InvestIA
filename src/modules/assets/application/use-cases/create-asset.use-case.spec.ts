import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateAssetUseCase } from './create-asset.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AssetType } from '../../domain/enums/asset-type.enum';

describe('CreateAssetUseCase', () => {
    let useCase: CreateAssetUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrismaService = {
            asset: {
                findUnique: jest.fn(),
                create: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateAssetUseCase,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        useCase = module.get<CreateAssetUseCase>(CreateAssetUseCase);
        prismaService = module.get(PrismaService);
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
            const createdAsset = {
                id: 'uuid-123',
                ticker: input.ticker,
                name: input.name,
                type: input.type,
                sector: input.sector,
                currentPrice: null,
                dividendYield: null,
                priceToEarnings: null,
                priceToBook: null,
                roe: null,
                netMargin: null,
                debtToEquity: null,
                lastUpdated: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prismaService.asset.findUnique.mockResolvedValue(null);
            prismaService.asset.create.mockResolvedValue(createdAsset);

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(result.ticker).toBe(input.ticker);
            expect(result.name).toBe(input.name);
            expect(result.type).toBe(input.type);
            expect(prismaService.asset.findUnique).toHaveBeenCalledWith({
                where: { ticker: input.ticker },
            });
        });

        it('should throw ConflictException when ticker already exists', async () => {
            // Arrange
            const input = {
                ticker: 'PETR4',
                name: 'Petrobras PN',
                type: AssetType.STOCK,
            };
            const existingAsset = {
                id: 'uuid-456',
                ticker: input.ticker,
                name: 'Existing',
                type: 'STOCK',
                sector: null,
                currentPrice: null,
                dividendYield: null,
                priceToEarnings: null,
                priceToBook: null,
                roe: null,
                netMargin: null,
                debtToEquity: null,
                lastUpdated: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prismaService.asset.findUnique.mockResolvedValue(existingAsset);

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(ConflictException);
            expect(prismaService.asset.create).not.toHaveBeenCalled();
        });
    });
});
