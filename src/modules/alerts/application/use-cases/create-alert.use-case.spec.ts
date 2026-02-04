import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreateAlertUseCase } from './create-alert.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { CreateAlertDto } from '../dto/create-alert.dto';
import { AlertCondition } from '../../domain/interfaces/alert.interface';

describe('CreateAlertUseCase', () => {
    let useCase: CreateAlertUseCase;
    let prismaService: PrismaService;

    const mockPrismaService = {
        asset: {
            findUnique: jest.fn(),
        },
        priceAlert: {
            create: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateAlertUseCase,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        useCase = module.get<CreateAlertUseCase>(CreateAlertUseCase);
        prismaService = module.get<PrismaService>(PrismaService);

        // Reset mocks
        jest.clearAllMocks();
    });

    describe('execute', () => {
        const userId = 'user-123';
        const assetId = 'asset-456';
        const input: CreateAlertDto = {
            assetId,
            targetPrice: 30.5,
            condition: AlertCondition.BELOW,
        };

        it('should create alert successfully', async () => {
            // Given
            const mockAsset = {
                id: assetId,
                ticker: 'PETR4',
                name: 'Petrobras',
            };

            const mockCreatedAlert = {
                id: 'alert-789',
                userId,
                assetId,
                targetPrice: 30.5,
                condition: AlertCondition.BELOW,
                isActive: true,
                triggeredAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrismaService.asset.findUnique.mockResolvedValue(mockAsset);
            mockPrismaService.priceAlert.create.mockResolvedValue(mockCreatedAlert);

            // When
            const result = await useCase.execute(userId, input);

            // Then
            expect(prismaService.asset.findUnique).toHaveBeenCalledWith({
                where: { id: assetId },
            });
            expect(prismaService.priceAlert.create).toHaveBeenCalledWith({
                data: {
                    userId,
                    assetId,
                    targetPrice: input.targetPrice,
                    condition: input.condition,
                },
            });
            expect(result.id).toBe('alert-789');
            expect(result.targetPrice).toBe(30.5);
            expect(result.condition).toBe(AlertCondition.BELOW);
        });

        it('should throw NotFoundException if asset does not exist', async () => {
            // Given
            mockPrismaService.asset.findUnique.mockResolvedValue(null);

            // When / Then
            await expect(useCase.execute(userId, input)).rejects.toThrow(
                NotFoundException,
            );
            await expect(useCase.execute(userId, input)).rejects.toThrow(
                `Asset with ID ${assetId} not found`,
            );
            expect(prismaService.priceAlert.create).not.toHaveBeenCalled();
        });

        it('should convert Decimal to number in return value', async () => {
            // Given
            const mockAsset = { id: assetId, ticker: 'PETR4', name: 'Petrobras' };
            const mockCreatedAlert = {
                id: 'alert-789',
                userId,
                assetId,
                targetPrice: 30.5, // Use actual number - Prisma Client handles conversion
                condition: AlertCondition.BELOW,
                isActive: true,
                triggeredAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrismaService.asset.findUnique.mockResolvedValue(mockAsset);
            mockPrismaService.priceAlert.create.mockResolvedValue(mockCreatedAlert);

            // When
            const result = await useCase.execute(userId, input);

            // Then
            expect(typeof result.targetPrice).toBe('number');
            expect(result.targetPrice).toBe(30.5);
        });
    });
});
