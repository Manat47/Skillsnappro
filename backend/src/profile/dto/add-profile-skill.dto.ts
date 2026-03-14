import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class AddProfileSkillDto {
  @Type(() => Number)
  @IsInt()
  skillId: number;
}
