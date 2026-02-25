import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let server: any;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }));
        await app.init();
        server = app.getHttpServer();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should register a new user', async () => {
        const email = `test-${Date.now()}@example.com`;
        const response = await request(server)
            .post('/auth/register')
            .send({
                email: email,
                password: 'password123',
                name: 'Test User'
            })
            .expect(201);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body.user.email).toBe(email.toLowerCase());
    });

    it('should NOT allow registering with the same email (case insensitive)', async () => {
        const email = `duplicate-${Date.now()}@example.com`;

        // First registration
        await request(server)
            .post('/auth/register')
            .send({
                email: email,
                password: 'password123',
                name: 'First User'
            })
            .expect(201);

        // Second registration with same email (exact match)
        await request(server)
            .post('/auth/register')
            .send({
                email: email,
                password: 'password123',
                name: 'Second User'
            })
            .expect(409); // Conflict

        // Third registration with same email (mixed case)
        await request(server)
            .post('/auth/register')
            .send({
                email: email.toUpperCase(),
                password: 'password123',
                name: 'Third User'
            })
            .expect(409); // Conflict
    });
});
