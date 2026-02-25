import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  name?: string;
}
