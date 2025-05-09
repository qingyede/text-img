import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreatService } from './creat.service';
import { CreateCreatDto } from './dto/create-creat.dto';
import { UpdateCreatDto } from './dto/update-creat.dto';

@Controller('creat')
export class CreatController {
  constructor(private readonly creatService: CreatService) {}

  @Post()
  create(@Body() createCreatDto: CreateCreatDto) {
    return this.creatService.create(createCreatDto);
  }

  @Get()
  findAll() {
    return this.creatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCreatDto: UpdateCreatDto) {
    return this.creatService.update(+id, updateCreatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creatService.remove(+id);
  }
}
