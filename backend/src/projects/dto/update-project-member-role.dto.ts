import { IsEnum } from 'class-validator';
import { MemberRole } from '@prisma/client';

export class UpdateProjectMemberRoleDto {
  @IsEnum(MemberRole)
  role: MemberRole;
}