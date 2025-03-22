import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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
  
  // Apply middleware
  app.use(helmet());
  app.use(morgan('dev'));
  
  // Enable CORS
  app.enableCors();
  
  // Get port from environment variable
  const port = configService.get<number>('ORDER_SERVICE_PORT', 3000);
  
  await app.listen(port);
  console.log(`Order service running on port ${port}`);
}

bootstrap();