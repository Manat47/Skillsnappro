import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

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
}