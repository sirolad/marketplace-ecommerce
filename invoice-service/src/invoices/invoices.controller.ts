import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  Get, 
  UseInterceptors, 
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FastifyFileInterceptor } from '@nestjs/platform-fastify';
import { FastifyReply } from 'fastify';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @UseInterceptors(
    FastifyFileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new Error('Only PDF files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @UploadedFile() file: any,
  ) {
    return this.invoicesService.create(createInvoiceDto, file);
  }

  @Get('order/:orderId')
  findByOrderId(@Param('orderId') orderId: string) {
    return this.invoicesService.findByOrderId(orderId);
  }

  @Get('download/:orderId')
  async downloadInvoice(
    @Param('orderId') orderId: string,
    @Res() res: FastifyReply,
  ) {
    const file = await this.invoicesService.getInvoiceFile(orderId);
    return res.status(200).sendFile(file.path, { 
      filename: file.filename,
      contentDisposition: `attachment; filename="${file.filename}"` 
    });
  }
}