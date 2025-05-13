import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCreatDto {
  @IsString({ message: '提示词必须是字符串-prompt' })
  @IsNotEmpty({ message: '提示词不能为空-prompt' })
  prompt: string;

  @IsOptional()
  @IsString({ message: '质量必须是字符串-quality' })
  quality?: string;

  @IsOptional()
  @IsString({ message: '尺寸必须是字符串-size' })
  size?: string;
}
