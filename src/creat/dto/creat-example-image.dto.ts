import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateExampleImageDto {
  @IsArray()
  @ArrayNotEmpty()
  promptList: string[]; // 多个提示词

  @IsString()
  modelType: string; // 模型类型，如 'gpt' | 'flux-dev' 等

  @IsString()
  userId: string;
}
