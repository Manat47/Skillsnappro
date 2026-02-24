import { IsOptional, IsString, IsIn, MaxLength, IsUrl, IsNotEmpty, IsEnum } from 'class-validator';
import { Visibility } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  full_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}