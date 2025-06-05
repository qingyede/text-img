import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // 自动添加 createdAt 和 updatedAt
export class ExampleImage extends Document {
  @Prop()
  prompt: string;

  @Prop({ type: String })
  modelType: string;

  @Prop()
  status: string; // 可选字段，推荐设置：pending | success | failed

  @Prop()
  image: string;

  @Prop()
  userId: string;

  @Prop() // 👈 补充：自定义时间字段（非 Mongo 默认的 createdAt）
  time: string;
}

export const ExampleImageSchema = SchemaFactory.createForClass(ExampleImage);
