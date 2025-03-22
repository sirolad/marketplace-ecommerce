import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';

async function bootstrap() {
  // Use FastifyAdapter instead of Express
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  
  // Get configuration service
  const configService = app.get(ConfigService);
  
  // Set global prefix from environment variable
  const apiPrefix = configService.get<string>('API_PREFIX', '/api/v1');
  app.setGlobalPrefix(apiPrefix);
  
  // Apply global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Apply Fastify plugins
  await app.register(fastifyHelmet);
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: configService.get<number>('MAX_FILE_SIZE', 5 * 1024 * 1024), // 5MB default
    },
  } as any);
  
  // Enable CORS
  app.enableCors();
  
  // Get port from environment variable
  const port = configService.get<number>('INVOICE_SERVICE_PORT', 3001);
  
  await app.listen(port, '0.0.0.0');
  console.log(`Invoice service running on port ${port}`);
}

bootstrap();