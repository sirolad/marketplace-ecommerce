import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  constructor(
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
    private readonly ordersService: OrdersService,
  ) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      console.log('Connected to RabbitMQ');
      
      // Subscribe to invoice.created events
      this.client.subscribe('invoice.created', async (data: { orderId: string, invoiceId: string }) => {
        console.log('Received invoice.created event:', data);
        try {
          // Update order to indicate it has an invoice
          await this.ordersService.updateInvoiceStatus(data.orderId, true);
          console.log(`Order ${data.orderId} updated with invoice status`);
        } catch (error) {
          console.error(`Error updating invoice status for order ${data.orderId}:`, error);
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