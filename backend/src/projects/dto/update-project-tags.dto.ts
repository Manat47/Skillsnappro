import { ArrayNotEmpty, IsArray, IsString, MaxLength } from 'class-validator';

export class UpdateProjectTagsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tagNames: string[];
}