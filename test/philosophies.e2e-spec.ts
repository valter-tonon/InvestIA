import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TestHelper } from './utils/test-helper';
import * as path from 'path';

describe('PhilosophiesController (e2e)', () => {
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

    describe('/philosophies/upload (POST)', () => {
        it('should upload a PDF file', () => {
            const pdfPath = path.join(process.cwd(), 'test/fixtures/sample.pdf');

            return request(app.getHttpServer())
                .post('/philosophies/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .field('title', 'My Philosophy')
                .field('description', 'Test Description')
                .attach('file', pdfPath)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.title).toBe('My Philosophy');
                    expect(res.body).toHaveProperty('extractedText');
                });
        });
    });

    describe('/philosophies (GET)', () => {
        it('should list philosophies', async () => {
            // Upload first
            const pdfPath = path.join(process.cwd(), 'test/fixtures/sample.pdf');

            await request(app.getHttpServer())
                .post('/philosophies/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .field('title', 'List Test')
                .attach('file', pdfPath);

            return request(app.getHttpServer())
                .get('/philosophies')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body.length).toBeGreaterThan(0);
                    expect(res.body[0].title).toBe('List Test');
                });
        });
    });
});
