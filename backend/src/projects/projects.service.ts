import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectMediaDto } from './dto/create-project-media.dto';
import { UpdateProjectMediaDto } from './dto/update-project-media.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-project-member-role.dto';


@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOwnedProjectOrThrow(userId: number, projectId: number) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      select: { id: true, ownerId: true },
    });

    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== userId) throw new ForbiddenException('Not your project');

    return project;
  }

  async create(userId: number, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ownerId: userId,
        title: dto.title,
        short_description: dto.short_description,
        description: dto.description,
        cover_image_url: dto.cover_image_url,
        // ไม่ส่งมาก็ปล่อยให้ DB default ทำงานได้ (PUBLIC)
        ...(dto.visibility ? { visibility: dto.visibility } : {}),
      },
      select: {
        id: true,
        title: true,
        short_description: true,
        description: true,
        cover_image_url: true,
        visibility: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findMy(userId: number) {
    return this.prisma.project.findMany({
      where: { ownerId: userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        short_description: true,
        cover_image_url: true,
        visibility: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

async findOne(requesterId: number, projectId: number) {
  const project = await this.prisma.project.findFirst({
    where: { id: projectId, deletedAt: null },
    select: {
      id: true,
      ownerId: true,
      visibility: true,
      title: true,
      short_description: true,
      description: true,
      cover_image_url: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!project) throw new NotFoundException('Project not found');

  const isOwner = project.ownerId === requesterId;

  if (project.visibility === 'PRIVATE' && !isOwner) {
    throw new ForbiddenException('This project is private');
  }

  return project;
}

  async update(userId: number, projectId: number, dto: UpdateProjectDto) {
    await this.getOwnedProjectOrThrow(userId, projectId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.short_description !== undefined ? { short_description: dto.short_description } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.cover_image_url !== undefined ? { cover_image_url: dto.cover_image_url } : {}),
        ...(dto.visibility !== undefined ? { visibility: dto.visibility } : {}),
      },
      select: {
        id: true,
        title: true,
        short_description: true,
        description: true,
        cover_image_url: true,
        visibility: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(userId: number, projectId: number) {
    await this.getOwnedProjectOrThrow(userId, projectId);

    await this.prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Deleted', projectId };
  }

  private async getProjectForView(projectId: number) {
  const project = await this.prisma.project.findFirst({
    where: { id: projectId, deletedAt: null },
    select: { id: true, ownerId: true, visibility: true },
  });
  if (!project) throw new NotFoundException('Project not found');
  return project;
}

  private assertCanViewProject(requesterId: number, project: { ownerId: number; visibility: any }) {
  const isOwner = project.ownerId === requesterId;
  if (project.visibility === 'PRIVATE' && !isOwner) {
    throw new ForbiddenException('This project is private');
    }
  }

  // GET /projects/:id/media
  async listMedia(requesterId: number, projectId: number) {
  const project = await this.getProjectForView(projectId);
  this.assertCanViewProject(requesterId, project);

  return this.prisma.projectMedia.findMany({
    where: { projectId, deletedAt: null },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  });
}

// POST /projects/:id/media  (owner only)
  async addMedia(ownerId: number, projectId: number, dto: CreateProjectMediaDto) {
  await this.getOwnedProjectOrThrow(ownerId, projectId);

  return this.prisma.projectMedia.create({
    data: {
      projectId,
      type: dto.type,
      url: dto.url,
      title: dto.title,
      description: dto.description,
      order: dto.order ?? 0,
    },
  });
}

// PATCH /projects/:id/media/:mediaId (owner only + ห้ามแก้ถ้าถูก soft delete)
  async updateMedia(ownerId: number, projectId: number, mediaId: number, dto: UpdateProjectMediaDto) {
  await this.getOwnedProjectOrThrow(ownerId, projectId);

  const media = await this.prisma.projectMedia.findFirst({
    where: { id: mediaId, projectId, deletedAt: null },
    select: { id: true },
  });
  if (!media) throw new NotFoundException('Media not found');

  return this.prisma.projectMedia.update({
    where: { id: mediaId },
    data: {
      ...(dto.url !== undefined ? { url: dto.url } : {}),
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.order !== undefined ? { order: dto.order } : {}),
    },
  });
}

// DELETE /projects/:id/media/:mediaId (soft delete)
  async removeMedia(ownerId: number, projectId: number, mediaId: number) {
  await this.getOwnedProjectOrThrow(ownerId, projectId);

  const media = await this.prisma.projectMedia.findFirst({
    where: { id: mediaId, projectId, deletedAt: null },
    select: { id: true },
  });
  if (!media) throw new NotFoundException('Media not found');

  await this.prisma.projectMedia.update({
    where: { id: mediaId },
    data: { deletedAt: new Date() },
  });

  return { message: 'Deleted', mediaId };
  }

  async getTags(requesterId: number, projectId: number) {
  const project = await this.getProjectForView(projectId);
  this.assertCanViewProject(requesterId, project);

  const rows = await this.prisma.projectTag.findMany({
    where: { projectId },
    include: { tag: true },
    orderBy: { tagId: 'asc' },
  });

  return rows.map(r => r.tag).filter(t => t.deletedAt === null);
}

async setTags(ownerId: number, projectId: number, tagNames: string[]) {
  await this.getOwnedProjectOrThrow(ownerId, projectId);

  const cleaned = Array.from(new Set(tagNames.map(t => t.trim()).filter(Boolean)));
  if (cleaned.length === 0) throw new BadRequestException('tagNames must not be empty');

  // 1) หา tag ที่ active อยู่แล้ว
  const existing = await this.prisma.tag.findMany({
    where: { name: { in: cleaned }, deletedAt: null },
    select: { id: true, name: true },
  });
  const map = new Map(existing.map(t => [t.name, t.id]));
  const missing = cleaned.filter(name => !map.has(name));

  if (missing.length > 0) {
    // 2) restore ชื่อที่เคยถูก soft delete (กัน unique ชน)
    const deleted = await this.prisma.tag.findMany({
      where: { name: { in: missing }, deletedAt: { not: null } },
      select: { id: true, name: true },
    });
    const deletedMap = new Map(deleted.map(t => [t.name, t.id]));

    for (const name of missing) {
      const id = deletedMap.get(name);
      if (id) {
        await this.prisma.tag.update({
          where: { id },
          data: { deletedAt: null },
        });
        map.set(name, id);
      }
    }

    // 3) ยังไม่เคยมีเลย -> create ใหม่
    const stillMissing = missing.filter(name => !map.has(name));
    if (stillMissing.length > 0) {
      await this.prisma.tag.createMany({
        data: stillMissing.map(name => ({ name })),
        skipDuplicates: true,
      });

      const newly = await this.prisma.tag.findMany({
        where: { name: { in: stillMissing }, deletedAt: null },
        select: { id: true, name: true },
      });
      newly.forEach(t => map.set(t.name, t.id));
    }
  }

  const tagIds = cleaned.map(name => map.get(name)!).filter(Boolean);

  // 4) replace pivot
  await this.prisma.$transaction([
    this.prisma.projectTag.deleteMany({ where: { projectId } }),
    this.prisma.projectTag.createMany({
      data: tagIds.map(tagId => ({ projectId, tagId })),
      skipDuplicates: true,
    }),
  ]);

  // 5) return tags หลัง set
  return this.getTags(ownerId, projectId);
  }

  async listMembers(requesterId: number, projectId: number) {
  const project = await this.getProjectForView(projectId);
  this.assertCanViewProject(requesterId, project); // public ดูได้ / private owner เท่านั้น (ตาม policy ปัจจุบัน)

  return this.prisma.projectMember.findMany({
    where: { projectId },
    select: {
      role: true,
      joinedAt: true,
      user: { select: { id: true, email: true } }, // เพิ่ม profile ทีหลังได้
    },
    orderBy: { joinedAt: 'asc' },
  });
}

async addMember(ownerId: number, projectId: number, dto: AddProjectMemberDto) {
  await this.getOwnedProjectOrThrow(ownerId, projectId);

  if (dto.userId === ownerId) {
    throw new BadRequestException('Owner is already the owner');
  }

  const user = await this.prisma.user.findUnique({
    where: { id: dto.userId },
    select: { id: true },
  });
  if (!user) throw new NotFoundException('User not found');

  await this.prisma.projectMember.create({
    data: {
      projectId,
      userId: dto.userId,
      ...(dto.role ? { role: dto.role } : {}),
    },
  }).catch(() => {
    throw new BadRequestException('User is already a member');
  });

  return { message: 'Added', userId: dto.userId };
}

async updateMemberRole(ownerId: number, projectId: number, memberUserId: number, role: any) {
  await this.getOwnedProjectOrThrow(ownerId, projectId);

  await this.prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId: memberUserId } },
    data: { role },
  }).catch(() => {
    throw new NotFoundException('Member not found');
  });

  return { message: 'Updated', userId: memberUserId, role };
}

async removeMember(ownerId: number, projectId: number, memberUserId: number) {
  const project = await this.getOwnedProjectOrThrow(ownerId, projectId);

  // กันลบ owner (owner ไม่ควรอยู่ใน member table หรือถ้าอยู่ก็ห้ามลบ)
  if (memberUserId === project.ownerId) {
    throw new BadRequestException('Cannot remove owner');
  }

  await this.prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: memberUserId } },
  }).catch(() => {
    throw new NotFoundException('Member not found');
  });

  return { message: 'Removed', userId: memberUserId };
}
}