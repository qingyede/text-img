import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCreatDto {
  @IsOptional()
  prompt?: string;

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

  @IsOptional()
  image_id?: string;

  @IsOptional()
  action?: string;

  @IsOptional()
  url?: string;

  @IsString({ message: '用户id必须是字符串-userId' })
  @IsNotEmpty({ message: '用户id不能为空-userId' })
  userId: string;

  @IsString({ message: 'type必须是字符串-type' })
  @IsNotEmpty({ message: 'type不能为空-type' })
  type: string;
}
