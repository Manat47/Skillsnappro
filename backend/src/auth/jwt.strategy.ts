import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
        //// 1. บอกให้ดึง Token จาก Header ที่ชื่อว่า 'Authorization: Bearer <token>'
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,//ถ้า Token หมดอายุตีกลับทันที
        // 2. ใช้ Secret Key จาก .env ในการตรวจสอบความถูกต้องของ Token
        secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
}
//ฟังก์ชันนี้จะทำงานหลังจากที่ Passport ตรวจสอบว่า Token ถูกต้องแล้ว (ไม่หมดอายุและเซ็นต์ถูกต้อง) โดย Payload จะเป็นข้อมูลที่เราใส่ตอนสร้าง Token (เช่น userId, email, role)
    async validate(payload: any) {
    //ข้อมูลใน payload จะมีโครงสร้างตามที่เรากำหนดตอนสร้าง Token เช่น { sub: userId, email: userEmail, role: userRole }
     return {
        userId:payload.sub,
        email:payload.email,
        role:payload.role,
     };
    }
}