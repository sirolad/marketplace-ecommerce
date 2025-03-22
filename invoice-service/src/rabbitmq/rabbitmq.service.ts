import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  constructor(
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
    private readonly invoicesService: InvoicesService,
  ) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      console.log('Connected to RabbitMQ');
      
      // Subscribe to order.shipped.with.invoice events
      this.client.subscribe('order.shipped.with.invoice', async (data: { orderId: string }) => {
        console.log('Received order.shipped.with.invoice event:', data);
        try {
          // Mark invoice as sent
          await this.invoicesService.markAsSent(data.orderId);
          console.log(`Invoice for order ${data.orderId} marked as sent`);
        } catch (error) {
          console.error(`Error processing invoice for order ${data.orderId}:`, error);
        }
      });
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
    }
  }

  async publishEvent(pattern: string, data: any) {
    return this.client.emit(pattern, data);
  }
}