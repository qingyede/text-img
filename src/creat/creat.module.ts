import { Module } from '@nestjs/common';
import { CreatService } from './creat.service';
import { CreatController } from './creat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CreatImgSchema, CreatImg } from './schemas/creatimg-schema';
import {
  ExampleImageSchema,
  ExampleImage,
} from './schemas/example-image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CreatImg.name, schema: CreatImgSchema },
      { name: ExampleImage.name, schema: ExampleImageSchema },
    ]),
  ],
  controllers: [CreatController],
  providers: [CreatService],
})
export class CreatModule {}
