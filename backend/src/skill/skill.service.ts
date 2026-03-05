import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSkillDto) {
    try {
      return await this.prisma.skill.create({
        data: { name: dto.name },
        select: { id: true, name: true },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException('Skill นี้มีอยู่แล้ว');
      }
      throw err;
    }
  }

  async findAll() {
    return this.prisma.skill.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  async findOne(id: number) {
    const skill = await this.prisma.skill.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true },
    });
    if (!skill) throw new NotFoundException('Skill not found');
    return skill;
  }

  async update(id: number, dto: UpdateSkillDto) {
    // กัน update ของที่ถูก soft delete ไปแล้ว
    const exists = await this.prisma.skill.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Skill not found');

    try {
      return await this.prisma.skill.update({
        where: { id },
        data: dto,
        select: { id: true, name: true },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException('Skill นี้มีอยู่แล้ว');
      }
      throw err;
    }
  }

  async softDelete(id: number) {
    const exists = await this.prisma.skill.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Skill not found');

    return this.prisma.skill.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true, name: true },
    });
  }
}