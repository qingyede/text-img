import { Injectable } from '@nestjs/common';
import { CreateCreatDto } from './dto/create-creat.dto';
import { UpdateCreatDto } from './dto/update-creat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatImg } from './schemas/creatimg-schema';
import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';
// import { APIKEY } from '@/constant/APP';

@Injectable()
export class CreatService {
  constructor(
    @InjectModel(CreatImg.name) private CreatImgModel: Model<CreatImg>,
  ) {}

  async create(createCreatDto: CreateCreatDto) {
    // / 配置代理
    const privateKey = process.env.NODE_PRIVATEKEY;

    const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7890'); // 使用与 curl 相同的代理地址
    const openai = new OpenAI({
      apiKey: privateKey,
      httpAgent: proxyAgent,
    });

    try {
      console.log(
        createCreatDto,
        'createCreatDtocreateCreatDtocreateCreatDtocreateCreatDtocreateCreatDto',
      );
      // 调用 OpenAI 文生图 API
      const result = await openai.images.generate({
        model: 'dall-e-2', // 注意：这里使用正确的模型名称，例如 'dall-e-3'
        prompt: createCreatDto.prompt,
        // quality: createCreatDto.quality as any,
        size: createCreatDto.size as any,
        // response_format: 'b64_json',
      });
      console.log(result);
      // 返回 base64 数据给前端
      return {
        code: 200,
        message: '图片生成成功',
        result,
      };
    } catch (error) {
      return {
        code: 10001,
        message: '图片生成失败',
        error: error,
      };
    }
  }

  findAll() {
    return `This action returns all creat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} creat`;
  }

  update(id: number, updateCreatDto: UpdateCreatDto) {
    return `${updateCreatDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} creat`;
  }
}
