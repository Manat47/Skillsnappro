import { IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileSkillsDto {
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  skillIds: number[];
}
