import { IsString, IsNumber, Min, Max, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;

  @IsString()
  author: string;
}

export class UpdateReviewStatusDto {
  @IsEnum(['PENDING_APPROVAL', 'APPROVED', 'REJECTED'])
  status: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
