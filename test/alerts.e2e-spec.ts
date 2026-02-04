import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TestHelper } from './utils/test-helper';
import { AlertCondition } from '../src/modules/alerts/domain/interfaces/alert.interface';

describe('AlertsController (e2e)', () => {
    let app: INestApplication;
    let helper: TestHelper;
    let prisma: PrismaService;

    beforeAll(async () => {
        // Create a mock queue
        const mockQueue = {
            add: jest.fn().mockResolvedValue({}),
            process: jest.fn(),
            on: jest.fn(),
            close: jest.fn().mockResolvedValue(undefined),
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider('BullQueue_alerts')
            .useValue(mockQueue)
            .compile();

        // Disable BullMQ workers to prevent Redis connection attempts
        const bullExplorer = moduleFixture.get('BullExplorer', { strict: false });
        if (bullExplorer && typeof bullExplorer.register === 'function') {
            bullExplorer.register = jest.fn();
        }

        app = moduleFixture.createNestApplication();
        await app.init();

        prisma = app.get(PrismaService);
        const jwtService = app.get(JwtService);
        helper = new TestHelper(app, prisma, jwtService);
    });

    beforeEach(async () => {
        await helper.cleanDatabase();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /alerts', () => {
        it('should create alert when authenticated', async () => {
            // Given
            const user = await helper.createUser('user@example.com');
            const token = helper.generateToken(user.id);

            const asset = await prisma.asset.create({
                data: {
                    ticker: 'PETR4',
                    name: 'Petrobras',
                    type: 'STOCK',
                    currentPrice: 30.0,
                },
            });

            // When / Then
            return request(app.getHttpServer())
                .post('/alerts')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    assetId: asset.id,
                    targetPrice: 35.0,
                    condition: AlertCondition.ABOVE,
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.assetId).toBe(asset.id);
                    expect(res.body.targetPrice).toBe(35.0);
                    expect(res.body.condition).toBe(AlertCondition.ABOVE);
                    expect(res.body.isActive).toBe(true);
                });
        });

        it('should fail without authentication (401)', () => {
            return request(app.getHttpServer())
                .post('/alerts')
                .send({
                    assetId: 'some-asset-id',
                    targetPrice: 35.0,
                    condition: AlertCondition.ABOVE,
                })
                .expect(401);
        });

        it('should fail with invalid assetId (404)', async () => {
            // Given
            const user = await helper.createUser('user@example.com');
            const token = helper.generateToken(user.id);

            // When / Then
            return request(app.getHttpServer())
                .post('/alerts')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    assetId: 'non-existent-asset-id',
                    targetPrice: 35.0,
                    condition: AlertCondition.ABOVE,
                })
                .expect(404);
        });
    });

    describe('GET /alerts', () => {
        it('should list alerts for authenticated user', async () => {
            // Given
            const user = await helper.createUser('user@example.com');
            const token = helper.generateToken(user.id);

            const asset = await prisma.asset.create({
                data: {
                    ticker: 'VALE3',
                    name: 'Vale',
                    type: 'STOCK',
                    currentPrice: 50.0,
                },
            });

            await prisma.priceAlert.create({
                data: {
                    userId: user.id,
                    assetId: asset.id,
                    targetPrice: 55.0,
                    condition: AlertCondition.ABOVE,
                },
            });

            // When / Then
            return request(app.getHttpServer())
                .get('/alerts')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body).toHaveLength(1);
                    expect(res.body[0].asset.ticker).toBe('VALE3');
                });
        });

        it('should return only alerts belonging to the user', async () => {
            // Given
            const user1 = await helper.createUser('user1@example.com');
            const user2 = await helper.createUser('user2@example.com');
            const token1 = helper.generateToken(user1.id);

            const asset = await prisma.asset.create({
                data: {
                    ticker: 'ITUB4',
                    name: 'Itaú',
                    type: 'STOCK',
                    currentPrice: 25.0,
                },
            });

            // Create alert for user1
            await prisma.priceAlert.create({
                data: {
                    userId: user1.id,
                    assetId: asset.id,
                    targetPrice: 30.0,
                    condition: AlertCondition.ABOVE,
                },
            });

            // Create alert for user2
            await prisma.priceAlert.create({
                data: {
                    userId: user2.id,
                    assetId: asset.id,
                    targetPrice: 20.0,
                    condition: AlertCondition.BELOW,
                },
            });

            // When / Then
            return request(app.getHttpServer())
                .get('/alerts')
                .set('Authorization', `Bearer ${token1}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveLength(1);
                    expect(res.body[0].targetPrice).toBe(30.0);
                });
        });

        it('should fail without authentication (401)', () => {
            return request(app.getHttpServer()).get('/alerts').expect(401);
        });
    });

    describe('PATCH /alerts/:id', () => {
        it('should update alert successfully', async () => {
            // Given
            const user = await helper.createUser('user@example.com');
            const token = helper.generateToken(user.id);

            const asset = await prisma.asset.create({
                data: {
                    ticker: 'BBAS3',
                    name: 'Banco do Brasil',
                    type: 'STOCK',
                    currentPrice: 40.0,
                },
            });

            const alert = await prisma.priceAlert.create({
                data: {
                    userId: user.id,
                    assetId: asset.id,
                    targetPrice: 45.0,
                    condition: AlertCondition.ABOVE,
                },
            });

            // When / Then
            return request(app.getHttpServer())
                .patch(`/alerts/${alert.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    targetPrice: 50.0,
                    condition: AlertCondition.BELOW,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.targetPrice).toBe(50.0);
                    expect(res.body.condition).toBe(AlertCondition.BELOW);
                });
        });

        it('should fail if alert does not belong to user (403)', async () => {
            // Given
            const user1 = await helper.createUser('user1@example.com');
            const user2 = await helper.createUser('user2@example.com');
            const token2 = helper.generateToken(user2.id);

            const asset = await prisma.asset.create({
                data: {
                    ticker: 'PETR4',
                    name: 'Petrobras',
                    type: 'STOCK',
                    currentPrice: 30.0,
                },
            });

            const alert = await prisma.priceAlert.create({
                data: {
                    userId: user1.id,
                    assetId: asset.id,
                    targetPrice: 35.0,
                    condition: AlertCondition.ABOVE,
                },
            });

            // When / Then
            return request(app.getHttpServer())
                .patch(`/alerts/${alert.id}`)
                .set('Authorization', `Bearer ${token2}`)
                .send({
                    targetPrice: 40.0,
                })
                .expect(403);
        });

        it('should fail without authentication (401)', async () => {
            return request(app.getHttpServer())
                .patch('/alerts/some-id')
                .send({ targetPrice: 40.0 })
                .expect(401);
        });
    });

    describe('DELETE /alerts/:id', () => {
        it('should delete alert successfully', async () => {
            // Given
            const user = await helper.createUser('user@example.com');
            const token = helper.generateToken(user.id);

            const asset = await prisma.asset.create({
                data: {
                    ticker: 'WEGE3',
                    name: 'WEG',
                    type: 'STOCK',
                    currentPrice: 35.0,
                },
            });

            const alert = await prisma.priceAlert.create({
                data: {
                    userId: user.id,
                    assetId: asset.id,
                    targetPrice: 40.0,
                    condition: AlertCondition.ABOVE,
                },
            });

            // When / Then
            await request(app.getHttpServer())
                .delete(`/alerts/${alert.id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            // Verify deletion
            const deletedAlert = await prisma.priceAlert.findUnique({
                where: { id: alert.id },
            });
            expect(deletedAlert).toBeNull();
        });

        it('should fail if alert does not belong to user (403)', async () => {
            // Given
            const user1 = await helper.createUser('user1@example.com');
            const user2 = await helper.createUser('user2@example.com');
            const token2 = helper.generateToken(user2.id);

            const asset = await prisma.asset.create({
                data: {
                    ticker: 'PETR4',
                    name: 'Petrobras',
                    type: 'STOCK',
                    currentPrice: 30.0,
                },
            });

            const alert = await prisma.priceAlert.create({
                data: {
                    userId: user1.id,
                    assetId: asset.id,
                    targetPrice: 35.0,
                    condition: AlertCondition.ABOVE,
                },
            });

            // When / Then
            return request(app.getHttpServer())
                .delete(`/alerts/${alert.id}`)
                .set('Authorization', `Bearer ${token2}`)
                .expect(403);
        });

        it('should fail without authentication (401)', () => {
            return request(app.getHttpServer())
                .delete('/alerts/some-id')
                .expect(401);
        });
    });

    describe('PATCH /alerts/:id/toggle', () => {
        it('should toggle alert from active to inactive', async () => {
            // Given
            const user = await helper.createUser('user@example.com');
            const token = helper.generateToken(user.id);

            const asset = await prisma.asset.create({
                data: {
                    ticker: 'ABEV3',
                    name: 'Ambev',
                    type: 'STOCK',
                    currentPrice: 15.0,
                },
            });

            const alert = await prisma.priceAlert.create({
                data: {
                    userId: user.id,
                    assetId: asset.id,
                    targetPrice: 20.0,
                    condition: AlertCondition.ABOVE,
                    isActive: true,
                },
            });

            // When / Then
            return request(app.getHttpServer())
                .patch(`/alerts/${alert.id}/toggle`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.isActive).toBe(false);
                });
        });

        it('should toggle alert from inactive to active', async () => {
            // Given
            const user = await helper.createUser('user@example.com');
            const token = helper.generateToken(user.id);

            const asset = await prisma.asset.create({
                data: {
                    ticker: 'MGLU3',
                    name: 'Magazine Luiza',
                    type: 'STOCK',
                    currentPrice: 5.0,
                },
            });

            const alert = await prisma.priceAlert.create({
                data: {
                    userId: user.id,
                    assetId: asset.id,
                    targetPrice: 10.0,
                    condition: AlertCondition.ABOVE,
                    isActive: false,
                },
            });

            // When / Then
            return request(app.getHttpServer())
                .patch(`/alerts/${alert.id}/toggle`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.isActive).toBe(true);
                });
        });

        it('should fail if alert does not belong to user (403)', async () => {
            // Given
            const user1 = await helper.createUser('user1@example.com');
            const user2 = await helper.createUser('user2@example.com');
            const token2 = helper.generateToken(user2.id);

            const asset = await prisma.asset.create({
                data: {
                    ticker: 'PETR4',
                    name: 'Petrobras',
                    type: 'STOCK',
                    currentPrice: 30.0,
                },
            });

            const alert = await prisma.priceAlert.create({
                data: {
                    userId: user1.id,
                    assetId: asset.id,
                    targetPrice: 35.0,
                    condition: AlertCondition.ABOVE,
                },
            });

            // When / Then
            return request(app.getHttpServer())
                .patch(`/alerts/${alert.id}/toggle`)
                .set('Authorization', `Bearer ${token2}`)
                .expect(403);
        });
    });
});
