import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TestHelper } from './utils/test-helper';

describe('AssetsController (e2e)', () => {
    let app: INestApplication;
    let helper: TestHelper;
    let authToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        const prisma = app.get(PrismaService);
        const jwtService = app.get(JwtService);
        helper = new TestHelper(app, prisma, jwtService);
    });

    beforeEach(async () => {
        await helper.cleanDatabase();
        const user = await helper.createUser();
        authToken = helper.generateToken(user.id);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/assets (POST)', () => {
        it('should create a new asset', () => {
            return request(app.getHttpServer())
                .post('/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    ticker: 'PETR4',
                    name: 'Petrobras',
                    type: 'Stock',
                    sector: 'Energy',
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.data).toHaveProperty('id');
                    expect(res.body.data.ticker).toBe('PETR4');
                });
        });

        it('should fail without authorization', () => {
            return request(app.getHttpServer())
                .post('/assets')
                .send({
                    ticker: 'VALE3',
                })
                .expect(401);
        });
    });

    describe('/assets (GET)', () => {
        it('should list assets', async () => {
            // Create an asset first
            await request(app.getHttpServer())
                .post('/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticker: 'WEGE3', name: 'Weg', type: 'Stock' });

            return request(app.getHttpServer())
                .get('/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body.data)).toBe(true);
                    expect(res.body.data.length).toBeGreaterThan(0);
                });
        });
    });

    describe('/assets/ticker/:ticker (GET)', () => {
        it('should get asset by ticker', async () => {
            await request(app.getHttpServer())
                .post('/assets')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticker: 'BBAS3', name: 'Banco do Brasil', type: 'Stock' });

            return request(app.getHttpServer())
                .get('/assets/ticker/BBAS3')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.ticker).toBe('BBAS3');
                });
        });
    });
});
