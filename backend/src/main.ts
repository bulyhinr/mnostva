// Polyfill for Node.js 18
if (!global.crypto) {
  // @ts-ignore
  global.crypto = require('crypto');
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // CORS Configuration
  app.enableCors({
    origin: (origin: string, callback: (err: Error | null, origin?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow localhost for local development
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }

      // Check against configured origin and primary domains
      const allowedOrigin = configService.get<string>('CORS_ORIGIN');
      const normalizedAllowed = allowedOrigin?.replace(/\/$/, '');
      const normalizedOrigin = origin.replace(/\/$/, '');

      if (
        (normalizedAllowed && normalizedOrigin === normalizedAllowed) ||
        origin.includes('mnostva.art') ||
        origin.includes('workers.dev') ||
        origin.includes('pages.dev')
      ) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  // API Prefix
  app.setGlobalPrefix('api');

  const port = configService.get('PORT', 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}/api`);
}
bootstrap();
