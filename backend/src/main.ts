import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  // 2. เปิดใช้งาน ValidationPipe (เพื่อให้ DTO ยามเฝ้าประตูทำงาน)
  // whitelist: true คือ ถ้าใครส่งข้อมูลแปลกปลอมมา ตัดทิ้งทันที!
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
  }));

  // 3. เปิด CORS (เพื่อให้ Frontend เรียก API ข้ามโดเมนได้)
  app.enableCors(); 

  await app.listen(3000);
}
bootstrap();