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

  @Prop()
  image: string;

  @Prop()
  type: string;

  @Prop()
  strength: string;

  @Prop()
  num_inference_steps: string;

  @Prop()
  guidance_scale: string;

  @Prop()
  enable_safety_checker: string;

  @Prop()
  img: string;
}

export const CreatImgSchema = SchemaFactory.createForClass(CreatImg);
