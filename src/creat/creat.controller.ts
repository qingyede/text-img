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
import { CreateExampleImageDto } from './dto/creat-example-image.dto';

@Controller('creat')
export class CreatController {
  constructor(private readonly creatService: CreatService) {}

  // 生成gpt图片
  @Post()
  create(@Body() createCreatDto: CreateCreatDto) {
    return this.creatService.create(createCreatDto);
  }

  // 生成模型示例图片
  @Post('creatExampleImg')
  runMidjourneyModel(@Body() createCreatDto: CreateExampleImageDto) {
    return this.creatService.creatExampleImg(createCreatDto);
  }

  // 根据用户查询用户生成图片的历史记录
  @Get()
  findAll(@Query('userId') userId: string) {
    console.log(userId);
    return this.creatService.findAll(userId);
  }

  // 根据模型获取模型生成的图片示例
  @Get('getExampleImg')
  findOne(@Query('model') model: string) {
    return this.creatService.findImgByModel(model);
  }

  @Delete()
  removeAll() {
    return this.creatService.removeAll();
  }

  // 删除所有示例图片
  @Delete('removeAllExampleImg')
  removeAllExampleImg() {
    return this.creatService.removeAllExampleImg();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creatService.remove(id);
  }
}
