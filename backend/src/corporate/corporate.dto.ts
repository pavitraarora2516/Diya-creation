import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEmail, IsDateString } from 'class-validator';

export class CreateCorporateLeadDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  gstDetails?: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  budgetRange: string;

  @IsDateString()
  @IsNotEmpty()
  deliveryDate: string;

  @IsString()
  @IsNotEmpty()
  requirements: string;
}

export class CreateQuotationDto {
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @IsDateString()
  @IsNotEmpty()
  validUntil: string;

  @IsString()
  @IsNotEmpty()
  details: string; // JSON string specifying custom items, unit prices, terms, and total pricing
}
