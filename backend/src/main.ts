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
  
  // Global Request Logger
  app.use((req, res, next) => {
    console.log(`[Incoming Request] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
  });

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

        // Allow any localhost origin
        if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
          return callback(null, true);
        }

        // Flexible match for mnostva domains and cloudflare previews
        const isMnostvaDomain =
          origin.includes('mnostva') ||
          origin.includes('workers.dev') ||
          origin.includes('pages.dev');

        if (isMnostvaDomain) {
          console.log(`CORS: Allowed by pattern matching. Origin: ${origin}`);
          return callback(null, true);
        }

        // Check against configured origin as fallback
        const allowedOrigin = configService.get<string>('CORS_ORIGIN');
        const normalizedAllowed = allowedOrigin?.replace(/\/$/, '');
        const normalizedOrigin = origin.replace(/\/$/, '');

        if (normalizedAllowed && normalizedOrigin === normalizedAllowed) {
          console.log(`CORS: Allowed by exact match. Origin: ${origin}`);
          return callback(null, true);
        }

        console.warn(`CORS: Blocked. Received Origin: ${origin}, Allowed Origin: ${allowedOrigin}`);
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    });

  // API Prefix
  app.setGlobalPrefix('api');

  const port = configService.get('PORT', 3001);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
