import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreatModule } from './creat/creat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CreatModule,
    // 环境变量
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'test'}`, // 动态加载 .env.test 或 .env.production
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/superimg'), // 连接字符串
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
