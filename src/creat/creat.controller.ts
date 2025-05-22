import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CreatService } from './creat.service';
import { CreateCreatDto } from './dto/create-creat.dto';

@Controller('creat')
export class CreatController {
  constructor(private readonly creatService: CreatService) {}

  // 生成gpt图片
  @Post()
  create(@Body() createCreatDto: CreateCreatDto) {
    return this.creatService.create(createCreatDto);
  }

  @Get()
  findAll(@Query('userId') userId: string) {
    console.log(userId);
    return this.creatService.findAll(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log(id, 'idididid');
    return this.creatService.translateToEnglish('我是幸运的');
  }

  @Delete()
  removeAll() {
    return this.creatService.removeAll();
  }
}
