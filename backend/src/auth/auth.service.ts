import { Injectable, ConflictException, UnauthorizedException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
  private prisma: PrismaService,
  private jwtService: JwtService,
) {}

  async register(dto: RegisterDto) {
    try {
      // 1. เช็กว่ามีอีเมลนี้ในระบบหรือยัง?
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: { id: true },
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
          role: 'STUDENT',
          profile: {
            create: {
              full_name: dto.full_name,
            },
          },
        },
        select: { id: true, email: true },
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
  
  async login(dto: LoginDto) {
    // 1. ค้นหา User ตาม Email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, role: true, password_hash: true },
    });

    // 2. ถ้าไม่เจอ User หรือ Password ไม่ตรง (เปรียบเทียบ Hash)
    if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    // 3. สร้างข้อมูลที่จะใส่ใน Token (Payload)
    const payload = { sub: user.id, email: user.email, role: user.role };

    // 4. สร้างและส่ง Access Token กลับไป
    return {
      message: 'เข้าสู่ระบบสำเร็จ',
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
