import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  content: string;

  @IsString()
  author: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDesc?: string;
}

export class UpdateSettingDto {
  @IsString()
  value: string;
}
