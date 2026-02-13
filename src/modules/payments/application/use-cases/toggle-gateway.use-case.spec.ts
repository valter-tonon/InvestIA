import { Test, TestingModule } from '@nestjs/testing';
import { ToggleGatewayUseCase } from './toggle-gateway.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { PaymentGateway } from '@prisma/client';

describe('ToggleGatewayUseCase', () => {
    let useCase: ToggleGatewayUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    const mockConfig = {
        id: 'config-id',
        gateway: PaymentGateway.STRIPE,
        isActive: false,
        isTest: true,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ToggleGatewayUseCase,
                {
                    provide: PrismaService,
                    useValue: {
                        paymentGatewayConfig: {
                            findUnique: jest.fn(),
                            updateMany: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        useCase = module.get<ToggleGatewayUseCase>(ToggleGatewayUseCase);
        prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should activate gateway successfully', async () => {
            const updatedConfig = { ...mockConfig, isActive: true };

            prismaService.paymentGatewayConfig.findUnique.mockResolvedValue(mockConfig as any);
            prismaService.paymentGatewayConfig.updateMany.mockResolvedValue({ count: 0 } as any);
            prismaService.paymentGatewayConfig.update.mockResolvedValue(updatedConfig as any);

            const result = await useCase.execute({
                gateway: PaymentGateway.STRIPE,
                isActive: true,
            });

            expect(result.isActive).toBe(true);
            expect(result.gateway).toBe(PaymentGateway.STRIPE);
        });

        it('should throw NotFoundException if config not found', async () => {
            prismaService.paymentGatewayConfig.findUnique.mockResolvedValue(null);

            await expect(
                useCase.execute({
                    gateway: PaymentGateway.STRIPE,
                    isActive: true,
                }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should deactivate other gateways when activating one', async () => {
            const updatedConfig = { ...mockConfig, isActive: true };

            prismaService.paymentGatewayConfig.findUnique.mockResolvedValue(mockConfig as any);
            prismaService.paymentGatewayConfig.updateMany.mockResolvedValue({ count: 1 } as any);
            prismaService.paymentGatewayConfig.update.mockResolvedValue(updatedConfig as any);

            await useCase.execute({
                gateway: PaymentGateway.STRIPE,
                isActive: true,
            });

            expect(prismaService.paymentGatewayConfig.updateMany).toHaveBeenCalledWith({
                where: {
                    gateway: { not: PaymentGateway.STRIPE },
                    isActive: true,
                },
                data: { isActive: false },
            });
        });

        it('should not deactivate other gateways when deactivating', async () => {
            const updatedConfig = { ...mockConfig, isActive: false };

            prismaService.paymentGatewayConfig.findUnique.mockResolvedValue({
                ...mockConfig,
                isActive: true,
            } as any);
            prismaService.paymentGatewayConfig.update.mockResolvedValue(updatedConfig as any);

            await useCase.execute({
                gateway: PaymentGateway.STRIPE,
                isActive: false,
            });

            expect(prismaService.paymentGatewayConfig.updateMany).not.toHaveBeenCalled();
        });
    });
});
