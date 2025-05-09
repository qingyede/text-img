import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 自动校验参数
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剥离无关字段
      forbidNonWhitelisted: true, // 有不认识的字段直接报错
      transform: true, // 自动把json转换成对应的DTO对象
    }),
  );
  // 开启跨域
  app.enableCors();
  await app.listen(process.env.PORT ?? 6009);
}
bootstrap();
