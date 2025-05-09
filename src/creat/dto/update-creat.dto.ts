import { PartialType } from '@nestjs/mapped-types';
import { CreateCreatDto } from './create-creat.dto';

export class UpdateCreatDto extends PartialType(CreateCreatDto) {}
