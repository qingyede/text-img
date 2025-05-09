import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCreatDto {
  @IsString({ message: '提示词必须是字符串-prompt' })
  @IsNotEmpty({ message: '提示词不能为空-prompt' })
  prompt: string;
}
