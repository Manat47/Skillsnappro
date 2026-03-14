import { IsOptional, IsEnum, IsString, MaxLength, IsUrl } from 'class-validator';
import { Visibility } from '@prisma/client';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  short_description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsUrl()
  cover_image_url?: string;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}