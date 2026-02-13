import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PaymentsModule } from '../payments.module';
import { PaymentGateway } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

describe('AdminGatewayConfigController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let jwtService: JwtService;
    let authToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [PaymentsModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        prisma = moduleFixture.get<PrismaService>(PrismaService);
        jwtService = moduleFixture.get<JwtService>(JwtService);

        // Create test admin user and token
        authToken = jwtService.sign({
            sub: 'test-admin-id',
            email: 'admin@test.com',
            role: 'SUPER_ADMIN',
        });
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        // Clean database
        await prisma.paymentGatewayConfig.deleteMany();
    });

    describe('POST /admin/gateway-config/stripe', () => {
        it('should create Stripe configuration', () => {
            return request(app.getHttpServer())
                .post('/admin/gateway-config/stripe')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    publishableKey: 'pk_test_xxx',
                    secretKey: 'sk_test_xxx',
                    webhookSecret: 'whsec_xxx',
                    isTest: true,
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('gateway', PaymentGateway.STRIPE);
                    expect(res.body).toHaveProperty('isActive', false);
                    expect(res.body).toHaveProperty('isTest', true);
                    expect(res.body).toHaveProperty('updatedAt');
                });
        });

        it('should return 401 without auth token', () => {
            return request(app.getHttpServer())
                .post('/admin/gateway-config/stripe')
                .send({
                    publishableKey: 'pk_test_xxx',
                    secretKey: 'sk_test_xxx',
                    isTest: true,
                })
                .expect(401);
        });

        it('should update existing configuration', async () => {
            // Create initial config
            await request(app.getHttpServer())
                .post('/admin/gateway-config/stripe')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    publishableKey: 'pk_test_old',
                    secretKey: 'sk_test_old',
                    isTest: true,
                })
                .expect(201);

            // Update config
            return request(app.getHttpServer())
                .post('/admin/gateway-config/stripe')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    publishableKey: 'pk_test_new',
                    secretKey: 'sk_test_new',
                    isTest: false,
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.isTest).toBe(false);
                });
        });
    });

    describe('GET /admin/gateway-config', () => {
        it('should list all gateway configurations', async () => {
            // Create a config first
            await prisma.paymentGatewayConfig.create({
                data: {
                    gateway: PaymentGateway.STRIPE,
                    apiKey: 'encrypted_pk',
                    secretKey: 'encrypted_sk',
                    webhookKey: 'encrypted_wh',
                    isActive: true,
                    isTest: true,
                },
            });

            return request(app.getHttpServer())
                .get('/admin/gateway-config')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body.length).toBeGreaterThan(0);
                    expect(res.body[0]).toHaveProperty('gateway');
                    expect(res.body[0]).toHaveProperty('isActive');
                    // Should not expose credentials
                    expect(res.body[0]).not.toHaveProperty('apiKey');
                    expect(res.body[0]).not.toHaveProperty('secretKey');
                });
        });

        it('should return empty array when no configs exist', () => {
            return request(app.getHttpServer())
                .get('/admin/gateway-config')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect([]);
        });
    });

    describe('PATCH /admin/gateway-config/:gateway/toggle', () => {
        beforeEach(async () => {
            await prisma.paymentGatewayConfig.create({
                data: {
                    gateway: PaymentGateway.STRIPE,
                    apiKey: 'encrypted_pk',
                    secretKey: 'encrypted_sk',
                    isActive: false,
                    isTest: true,
                },
            });
        });

        it('should activate gateway', () => {
            return request(app.getHttpServer())
                .patch('/admin/gateway-config/STRIPE/toggle')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ isActive: true })
                .expect(200)
                .expect((res) => {
                    expect(res.body.isActive).toBe(true);
                });
        });

        it('should deactivate gateway', async () => {
            // First activate
            await prisma.paymentGatewayConfig.update({
                where: { gateway: PaymentGateway.STRIPE },
                data: { isActive: true },
            });

            return request(app.getHttpServer())
                .patch('/admin/gateway-config/STRIPE/toggle')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ isActive: false })
                .expect(200)
                .expect((res) => {
                    expect(res.body.isActive).toBe(false);
                });
        });

        it('should return 404 for non-existent gateway', () => {
            return request(app.getHttpServer())
                .patch('/admin/gateway-config/PAGARME/toggle')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ isActive: true })
                .expect(404);
        });
    });
});
