import { Test, TestingModule } from '@nestjs/testing';
import { UpdateGatewayConfigUseCase } from './update-gateway-config.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { EncryptionService } from '../../../../infrastructure/services/encryption.service';
import { BadRequestException } from '@nestjs/common';
import { PaymentGateway } from '@prisma/client';

describe('UpdateGatewayConfigUseCase', () => {
    let useCase: UpdateGatewayConfigUseCase;
    let prismaService: jest.Mocked<PrismaService>;
    let encryptionService: jest.Mocked<EncryptionService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateGatewayConfigUseCase,
                {
                    provide: PrismaService,
                    useValue: {
                        paymentGatewayConfig: {
                            upsert: jest.fn(),
                        },
                    },
                },
                {
                    provide: EncryptionService,
                    useValue: {
                        encrypt: jest.fn((text) => `encrypted_${text}`),
                    },
                },
            ],
        }).compile();

        useCase = module.get<UpdateGatewayConfigUseCase>(UpdateGatewayConfigUseCase);
        prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
        encryptionService = module.get(EncryptionService) as jest.Mocked<EncryptionService>;
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should encrypt and save gateway config', async () => {
            const mockConfig = {
                id: 'config-id',
                gateway: PaymentGateway.STRIPE,
                apiKey: 'encrypted_pk_test_xxx',
                secretKey: 'encrypted_sk_test_xxx',
                webhookKey: 'encrypted_whsec_xxx',
                isActive: false,
                isTest: true,
                config: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prismaService.paymentGatewayConfig.upsert.mockResolvedValue(mockConfig);

            const result = await useCase.execute({
                gateway: PaymentGateway.STRIPE,
                apiKey: 'pk_test_xxx',
                secretKey: 'sk_test_xxx',
                webhookKey: 'whsec_xxx',
                isTest: true,
            });

            expect(encryptionService.encrypt).toHaveBeenCalledWith('pk_test_xxx');
            expect(encryptionService.encrypt).toHaveBeenCalledWith('sk_test_xxx');
            expect(encryptionService.encrypt).toHaveBeenCalledWith('whsec_xxx');

            expect(prismaService.paymentGatewayConfig.upsert).toHaveBeenCalledWith({
                where: { gateway: PaymentGateway.STRIPE },
                create: expect.objectContaining({
                    gateway: PaymentGateway.STRIPE,
                    apiKey: 'encrypted_pk_test_xxx',
                    secretKey: 'encrypted_sk_test_xxx',
                    webhookKey: 'encrypted_whsec_xxx',
                    isActive: false,
                    isTest: true,
                }),
                update: expect.objectContaining({
                    apiKey: 'encrypted_pk_test_xxx',
                    secretKey: 'encrypted_sk_test_xxx',
                    webhookKey: 'encrypted_whsec_xxx',
                    isTest: true,
                }),
            });

            expect(result).toEqual({
                gateway: PaymentGateway.STRIPE,
                isActive: false,
                isTest: true,
                updatedAt: mockConfig.updatedAt,
            });
        });

        it('should throw error if apiKey is missing', async () => {
            await expect(
                useCase.execute({
                    gateway: PaymentGateway.STRIPE,
                    apiKey: '',
                    secretKey: 'sk_test_xxx',
                    isTest: true,
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw error if secretKey is missing', async () => {
            await expect(
                useCase.execute({
                    gateway: PaymentGateway.STRIPE,
                    apiKey: 'pk_test_xxx',
                    secretKey: '',
                    isTest: true,
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should handle optional webhookKey', async () => {
            const mockConfig = {
                id: 'config-id',
                gateway: PaymentGateway.STRIPE,
                apiKey: 'encrypted_pk_test_xxx',
                secretKey: 'encrypted_sk_test_xxx',
                webhookKey: null,
                isActive: false,
                isTest: true,
                config: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prismaService.paymentGatewayConfig.upsert.mockResolvedValue(mockConfig);

            await useCase.execute({
                gateway: PaymentGateway.STRIPE,
                apiKey: 'pk_test_xxx',
                secretKey: 'sk_test_xxx',
                isTest: true,
            });

            expect(prismaService.paymentGatewayConfig.upsert).toHaveBeenCalledWith({
                where: { gateway: PaymentGateway.STRIPE },
                create: expect.objectContaining({
                    webhookKey: null,
                }),
                update: expect.objectContaining({
                    webhookKey: null,
                }),
            });
        });
    });
});
