import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { MemberRole } from '@prisma/client';

export class AddProjectMemberDto {
  @Type(() => Number)
  @IsInt()
  userId: number;

  @IsOptional()
  @IsEnum(MemberRole)
  role?: MemberRole; // ไม่ส่ง = default MEMBER
}