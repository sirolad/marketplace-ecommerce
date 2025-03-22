import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, file: Express.Multer.File): Promise<Invoice> {
    if (!file) {
      throw new BadRequestException('PDF file is required');
    }

    // Check if file is PDF
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    // Check if invoice already exists for this order
    const existingInvoice = await this.invoiceModel.findOne({ 
      orderId: createInvoiceDto.orderId 
    }).exec();
    
    if (existingInvoice) {
      throw new BadRequestException(`Invoice already exists for order ${createInvoiceDto.orderId}`);
    }

    const invoice = new this.invoiceModel({
      orderId: createInvoiceDto.orderId,
      filePath: file.path,
    });
    
    const savedInvoice = await invoice.save();
    
    // Notify order service that invoice has been uploaded
    await this.rabbitMQService.publishEvent('invoice.created', {
      orderId: savedInvoice.orderId,
      invoiceId: savedInvoice._id,
    });
    
    return savedInvoice;
  }

  async findByOrderId(orderId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findOne({ orderId }).exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice for order ${orderId} not found`);
    }
    return invoice;
  }

  async markAsSent(orderId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findOne({ orderId }).exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice for order ${orderId} not found`);
    }
    
    invoice.sentAt = new Date();
    return invoice.save();
  }

  async getInvoiceFile(orderId: string): Promise<{ path: string; filename: string }> {
    const invoice = await this.findByOrderId(orderId);
    
    if (!fs.existsSync(invoice.filePath)) {
      throw new NotFoundException('Invoice file not found');
    }
    
    return {
      path: invoice.filePath,
      filename: path.basename(invoice.filePath),
    };
  }
}