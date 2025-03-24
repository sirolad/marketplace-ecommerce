import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('API_PREFIX', '/api/v1');
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.register(helmet);
  await app.register(multipart, {
    limits: {
      fileSize: configService.get<number>('MAX_FILE_SIZE', 5 * 1024 * 1024),
    },
  });
  app.enableCors();
  const port = configService.get<number>('INVOICE_SERVICE_PORT', 3001);

  await app.listen(port, '0.0.0.0');
  console.log(`Invoice service running on port ${port}`);
}
bootstrap();
