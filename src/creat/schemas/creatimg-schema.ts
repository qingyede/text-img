import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CatDocument = CreatImg & Document;

@Schema()
export class CreatImg {
  @Prop({ required: true })
  prompt: string;
}

export const CreatImgSchema = SchemaFactory.createForClass(CreatImg);
