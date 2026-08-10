import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  // ── Startup secret validation ────────────────────────────────────────────
  if (!process.env.JWT_SECRET) {
    logger.error('FATAL: JWT_SECRET environment variable is not set. Application cannot start securely.');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    logger.error('FATAL: DATABASE_URL environment variable is not set. Application cannot connect to database.');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';

  // ── Helmet Security Headers ──────────────────────────────────────────────
  // CSP configured to allow Razorpay, Google Fonts, and self
  app.use(helmet({
    contentSecurityPolicy: isProduction ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://checkout.razorpay.com',
          'https://api.razorpay.com',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          'https://api.razorpay.com',
          'https://checkout.razorpay.com',
          process.env.NEXT_PUBLIC_API_URL || '',
        ].filter(Boolean),
        frameSrc: ['https://api.razorpay.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    } : false, // Disable CSP in development
    crossOriginEmbedderPolicy: false, // Required for Razorpay iframe
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
  }));

  // ── CORS Configuration ──────────────────────────────────────────────────
  let allowedOrigins: string[] = [];

  if (process.env.CORS_ALLOWED_ORIGINS) {
    allowedOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  } else if (!isProduction) {
    allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ];
  }

  app.enableCors({
    origin: isProduction
      ? allowedOrigins
      : allowedOrigins.length > 0
        ? allowedOrigins
        : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ── Global Prefix & Validation ──────────────────────────────────────────
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  const port = process.env.PORT || 5000;
  await app.listen(port);
  logger.log(`Application is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.log(`Health check: http://localhost:${port}/health`);
}
bootstrap();

