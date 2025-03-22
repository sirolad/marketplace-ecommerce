import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';

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
  
  // Apply middleware (Fastify uses plugins instead of middleware)
  await app.register(fastifyHelmet);
  
  // Enable CORS
  app.enableCors();
  
  // Get port from environment variable
  const port = configService.get<number>('ORDER_SERVICE_PORT', 3000);
  
  await app.listen(port, '0.0.0.0');
  console.log(`Order service running on port ${port}`);
}

bootstrap();