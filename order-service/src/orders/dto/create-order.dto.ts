import { IsString, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  productId: string;

  @IsString()
  customerId: string;

  @IsString()
  sellerId: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}