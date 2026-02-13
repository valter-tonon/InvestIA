import { Test, TestingModule } from '@nestjs/testing';
import { TestGatewayConnectionUseCase } from './test-gateway-connection.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PaymentGatewayFactory } from '../../infrastructure/factories/payment-gateway.factory';
import { BadRequestException } from '@nestjs/common';
import { PaymentGateway } from '@prisma/client';

describe('TestGatewayConnectionUseCase', () => {
    let useCase: TestGatewayConnectionUseCase;
    let prismaService: jest.Mocked<PrismaService>;
    let gatewayFactory: jest.Mocked<PaymentGatewayFactory>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TestGatewayConnectionUseCase,
                {
                    provide: PrismaService,
                    useValue: {
                        paymentGatewayConfig: {
                            findUnique: jest.fn(),
                        },
                    },
                },
                {
                    provide: PaymentGatewayFactory,
                    useValue: {
                        create: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<TestGatewayConnectionUseCase>(TestGatewayConnectionUseCase);
        prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
        gatewayFactory = module.get(PaymentGatewayFactory) as jest.Mocked<PaymentGatewayFactory>;
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should test connection successfully', async () => {
            const mockConfig = {
                gateway: PaymentGateway.STRIPE,
                isTest: true,
                isActive: true,
            };
            const mockGateway = {};

            prismaService.paymentGatewayConfig.findUnique.mockResolvedValue(mockConfig as any);
            gatewayFactory.create.mockResolvedValue(mockGateway as any);

            const result = await useCase.execute({ gateway: PaymentGateway.STRIPE });

            expect(result.success).toBe(true);
            expect(result.gateway).toBe(PaymentGateway.STRIPE);
            expect(result.message).toBe('Connection successful');
            expect(result.isTest).toBe(true);
        });

        it('should return error if gateway not configured', async () => {
            prismaService.paymentGatewayConfig.findUnique.mockResolvedValue(null);

            const result = await useCase.execute({ gateway: PaymentGateway.STRIPE });

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should return error if gateway creation fails', async () => {
            const mockConfig = {
                gateway: PaymentGateway.STRIPE,
                isTest: true,
            };

            prismaService.paymentGatewayConfig.findUnique.mockResolvedValue(mockConfig as any);
            gatewayFactory.create.mockRejectedValue(new Error('Invalid credentials'));

            const result = await useCase.execute({ gateway: PaymentGateway.STRIPE });

            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid credentials');
        });
    });
});
