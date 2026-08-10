import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHamperBoxDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @IsString()
  @IsNotEmpty()
  dimensions: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class CreateHamperComponentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsString()
  @IsNotEmpty()
  type: string; // CHOCOLATE, GIFT, ADDON

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class BuildHamperItemDto {
  @IsString()
  @IsNotEmpty()
  componentId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class BuildHamperDto {
  @IsString()
  @IsNotEmpty()
  boxId: string;

  @IsString()
  @IsOptional()
  wrapping?: string;

  @IsString()
  @IsOptional()
  ribbonColor?: string;

  @IsString()
  @IsOptional()
  greetingMsg?: string;

  @IsString()
  @IsOptional()
  greetingImg?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BuildHamperItemDto)
  items: BuildHamperItemDto[];
}
