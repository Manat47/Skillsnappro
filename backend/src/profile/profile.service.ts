import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdateProfileSkillsDto } from "./dto/update-profile-skills.dto";

type SkillSummary = {
  id: number;
  name: string;
};

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        id: true,
        full_name: true,
        bio: true,
        avatar_url: true,
        visibility: true,
      }
    });
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }
    return profile;
  }

  async updateMyProfile(userId: number, dto: UpdateProfileDto) {
  const profile = await this.prisma.profile.upsert({
    where: { userId },       
    update: {...dto},
    create: {
      userId,
      ...dto,
      full_name: dto.full_name ?? 'Unnamed',
    },
    select: {
      id: true,
      full_name: true,
      bio: true,
      avatar_url: true,
      visibility: true,
    },
  });
  return { message: 'Profile updated successfully', profile };
  }

  async getMyProfileSkills(userId: number) {
    const profile = await this.getProfileOrThrow(userId);
    return this.listSkillsByProfileId(profile.id);
  }

  async replaceMyProfileSkills(userId: number, dto: UpdateProfileSkillsDto) {
    const profile = await this.getProfileOrThrow(userId);
    const uniqueSkillIds = [...new Set(dto.skillIds)];

    await this.assertSkillsExist(uniqueSkillIds);

    await this.prisma.$transaction(async (tx) => {
      await tx.profileSkill.deleteMany({
        where: { profileId: profile.id },
      });

      if (uniqueSkillIds.length > 0) {
        await tx.profileSkill.createMany({
          data: uniqueSkillIds.map((skillId) => ({
            profileId: profile.id,
            skillId,
          })),
          skipDuplicates: true,
        });
      }
    });

    return {
      message: 'Profile skills updated successfully',
      skills: await this.listSkillsByProfileId(profile.id),
    };
  }

  async addMyProfileSkill(userId: number, skillId: number) {
    const profile = await this.getProfileOrThrow(userId);
    const skill = await this.getActiveSkillOrThrow(skillId);

    try {
      await this.prisma.profileSkill.create({
        data: {
          profileId: profile.id,
          skillId,
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException('Skill already added to profile');
      }
      throw err;
    }

    return {
      message: 'Profile skill added successfully',
      skill,
    };
  }

  async removeMyProfileSkill(userId: number, skillId: number) {
    const profile = await this.getProfileOrThrow(userId);
    const existing = await this.prisma.profileSkill.findUnique({
      where: {
        profileId_skillId: {
          profileId: profile.id,
          skillId,
        },
      },
      select: { skillId: true },
    });

    if (!existing) {
      throw new NotFoundException('Profile skill not found');
    }

    await this.prisma.profileSkill.delete({
      where: {
        profileId_skillId: {
          profileId: profile.id,
          skillId,
        },
      },
    });

    return {
      message: 'Profile skill removed successfully',
      skillId,
    };
  }
  
  async getProfileByUserId(requester: { userId: number; role: string }, targetUserId: number) {
  const profile = await this.prisma.profile.findUnique({
    where: { userId: targetUserId },
    select: {
      id: true,
      full_name: true,
      bio: true,
      avatar_url: true,
      visibility: true,
      userId: true,
    },
  });

  if (!profile) throw new NotFoundException('Profile not found');

  const isOwner = requester.userId === targetUserId;
  const isAdmin = requester.role === 'ADMIN';

  if (profile.visibility === 'PRIVATE' && !isOwner && !isAdmin) {
    throw new ForbiddenException('This profile is private');
  }

  // ป้องกันไม่ให้หลุด userId ถ้าคุณไม่อยากโชว์
  const { userId, ...safeProfile } = profile;
  return safeProfile;
}

  private async getProfileOrThrow(userId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true, userId: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  private async getActiveSkillOrThrow(skillId: number): Promise<SkillSummary> {
    const skill = await this.prisma.skill.findFirst({
      where: { id: skillId, deletedAt: null },
      select: { id: true, name: true },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  private async assertSkillsExist(skillIds: number[]) {
    if (skillIds.length === 0) {
      return;
    }

    const skills = await this.prisma.skill.findMany({
      where: {
        id: { in: skillIds },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (skills.length !== skillIds.length) {
      throw new NotFoundException('One or more skills not found');
    }
  }

  private async listSkillsByProfileId(profileId: number): Promise<SkillSummary[]> {
    const rows = await this.prisma.profileSkill.findMany({
      where: {
        profileId,
        skill: {
          deletedAt: null,
        },
      },
      select: {
        skill: {
          select: { id: true, name: true },
        },
      },
    });

    return rows
      .map((row) => row.skill)
      .sort((left, right) => left.name.localeCompare(right.name));
  }
}
