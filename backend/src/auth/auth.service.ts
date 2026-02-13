import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    try {
      // 1. เช็กว่ามีอีเมลนี้ในระบบหรือยัง?
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
      }

      // 2. เข้ารหัสรหัสผ่าน (Hashing)
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(dto.password, salt);

      // 3. สร้าง User + Profile พร้อมกัน
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password_hash: hashedPassword,
          role: 'STUDENT', // Default เป็นนักเรียน
          profile: {
            create: {
              full_name: dto.full_name,
            },
          },
        },
      });

      // 4. ส่งค่ากลับ (ไม่ส่ง password กลับไป)
      return {
        message: 'สมัครสมาชิกสำเร็จ',
        userId: user.id,
        email: user.email,
      };
    } catch (err: any) {
      // 5. ดักจับกรณี Race Condition (unique constraint)
      if (err?.code === 'P2002') {
        throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
      }
      throw err;
    }
  }
}
