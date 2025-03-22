import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoicesModule } from './invoices/invoices.module';
import { HealthModule } from './health/health.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('INVOICE_MONGODB_URI'),
      }),
    }),
    InvoicesModule,
    HealthModule,
    RabbitMQModule,
  ],
})
export class AppModule {}