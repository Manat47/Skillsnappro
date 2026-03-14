import { IsInt, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProjectMediaDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}