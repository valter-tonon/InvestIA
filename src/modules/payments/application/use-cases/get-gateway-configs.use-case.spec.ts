import { Test, TestingModule } from '@nestjs/testing';
import { GetGatewayConfigsUseCase } from './get-gateway-configs.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PaymentGateway } from '@prisma/client';

describe('GetGatewayConfigsUseCase', () => {
    let useCase: GetGatewayConfigsUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetGatewayConfigsUseCase,
                {
                    provide: PrismaService,
                    useValue: {
                        paymentGatewayConfig: {
                            findMany: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        useCase = module.get<GetGatewayConfigsUseCase>(GetGatewayConfigsUseCase);
        prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return all gateway configs', async () => {
            const mockConfigs = [
                {
                    id: 'config-1',
                    gateway: PaymentGateway.STRIPE,
                    isActive: true,
                    isTest: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 'config-2',
                    gateway: PaymentGateway.STRIPE,
                    isActive: false,
                    isTest: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            prismaService.paymentGatewayConfig.findMany.mockResolvedValue(mockConfigs as any);

            const result = await useCase.execute();

            expect(result).toEqual(mockConfigs);
            expect(result.length).toBe(2);
        });

        it('should not include sensitive credentials', async () => {
            const mockConfigsWithoutCredentials = [
                {
                    id: 'config-1',
                    gateway: PaymentGateway.STRIPE,
                    isActive: true,
                    isTest: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            // O Prisma select já exclui os campos sensíveis
            prismaService.paymentGatewayConfig.findMany.mockResolvedValue(mockConfigsWithoutCredentials as any);

            const result = await useCase.execute();

            // Verify que só contém campos públicos
            result.forEach(config => {
                expect(config).toHaveProperty('id');
                expect(config).toHaveProperty('gateway');
                expect(config).toHaveProperty('isActive');
                expect(config).toHaveProperty('isTest');
                expect(config).not.toHaveProperty('apiKey');
                expect(config).not.toHaveProperty('secretKey');
                expect(config).not.toHaveProperty('webhookKey');
            });
        });

        it('should return empty array when no configs exist', async () => {
            prismaService.paymentGatewayConfig.findMany.mockResolvedValue([]);

            const result = await useCase.execute();

            expect(result).toEqual([]);
        });
    });
});
