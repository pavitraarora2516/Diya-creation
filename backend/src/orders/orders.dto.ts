import { IsString, IsNotEmpty, IsNumber, IsOptional, IsJSON } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  hamperId?: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  customizations?: string; // JSON string containing chosen personalization choices
}

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @IsString()
  @IsNotEmpty()
  billingAddress: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string; // RAZORPAY, COD

  @IsString()
  @IsOptional()
  couponCode?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string; // PENDING_PAYMENT, CONFIRMED, PRODUCTION, PACKED, SHIPPED, DELIVERED, CANCELLED
}

export class MockPaymentWebhookDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  status: string; // SUCCESS, FAILED
}
