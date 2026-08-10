import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomOptionDto {
  @IsString()
  @IsNotEmpty()
  type: string; // TEXT, IMAGE, COLOR, RIBBON, CARD

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsNumber()
  @IsOptional()
  priceCharge?: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @IsNotEmpty()
  costPrice: number;

  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  shelfLife?: string;

  @IsString()
  @IsOptional()
  ingredients?: string;

  @IsString()
  @IsOptional()
  allergens?: string;

  @IsString()
  @IsOptional()
  packaging?: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsBoolean()
  @IsOptional()
  customizable?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomOptionDto)
  @IsOptional()
  customOptions?: CustomOptionDto[];
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  shelfLife?: string;

  @IsString()
  @IsOptional()
  ingredients?: string;

  @IsString()
  @IsOptional()
  allergens?: string;

  @IsString()
  @IsOptional()
  packaging?: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  customizable?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomOptionDto)
  @IsOptional()
  customOptions?: CustomOptionDto[];
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;
}
