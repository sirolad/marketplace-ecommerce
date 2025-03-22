import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = new this.orderModel(createOrderDto);
    const savedOrder = await order.save();
    
    // Publish order created event
    await this.rabbitMQService.publishEvent('order.created', savedOrder);
    
    return savedOrder;
  }

  async findAll(query: any = {}): Promise<Order[]> {
    return this.orderModel.find(query).exec();
  }

  async findBySellerId(sellerId: string): Promise<Order[]> {
    return this.orderModel.find({ sellerId }).exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const previousStatus = order.status;
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .exec();
    
    // If status changed, publish an event
    if (updateOrderDto.status && previousStatus !== updateOrderDto.status) {
      await this.rabbitMQService.publishEvent('order.status.updated', {
        orderId: updatedOrder._id,
        previousStatus,
        currentStatus: updatedOrder.status,
      });
      
      // If order is shipped and has an invoice, publish an event to send the invoice
      if (updatedOrder.status === OrderStatus.SHIPPED && updatedOrder.hasInvoice) {
        await this.rabbitMQService.publishEvent('order.shipped.with.invoice', {
          orderId: updatedOrder._id,
        });
      }
    }
    
    return updatedOrder;
  }

  async updateInvoiceStatus(id: string, hasInvoice: boolean): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.hasInvoice = hasInvoice;
    await order.save();
    
    // If order is already shipped and now has an invoice, publish an event
    if (order.status === OrderStatus.SHIPPED && hasInvoice) {
      await this.rabbitMQService.publishEvent('order.shipped.with.invoice', {
        orderId: order._id,
      });
    }
    
    return order;
  }
}