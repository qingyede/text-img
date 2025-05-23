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

  @IsOptional()
  strength?: string;

  @IsOptional()
  num_inference_steps?: string;

  @IsOptional()
  guidance_scale?: string;

  @IsOptional()
  enable_safety_checker?: string;

  @IsOptional()
  img?: string;

  @IsString({ message: '用户id必须是字符串-userId' })
  @IsNotEmpty({ message: '用户id不能为空-userId' })
  userId: string;

  @IsString({ message: 'type必须是字符串-type' })
  @IsNotEmpty({ message: 'type不能为空-type' })
  type: string;
}
