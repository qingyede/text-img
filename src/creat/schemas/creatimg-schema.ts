import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CreatImgDocument = CreatImg & Document;

@Schema({ timestamps: true }) // 添加 timestamps 方便按时间排序
export class CreatImg {
  @Prop({ required: true })
  prompt: string;

  @Prop({ required: true })
  userId: string;

  @Prop()
  quality: string;

  @Prop()
  size: string;

  @Prop()
  time: string;

  @Prop() // 标记为必填项
  image: string;
}

export const CreatImgSchema = SchemaFactory.createForClass(CreatImg);
