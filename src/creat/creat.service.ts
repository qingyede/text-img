import { Injectable } from '@nestjs/common';
import { CreateCreatDto } from './dto/create-creat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatImg } from './schemas/creatimg-schema';
import OpenAI from 'openai';
import { translateToEnglish } from './api/index';
import { isPureEnglish } from '@/hook/common/isPureEnglish';
// import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class CreatService {
  constructor(
    @InjectModel(CreatImg.name) private CreatImgModel: Model<CreatImg>,
  ) {}

  async create(createCreatDto: CreateCreatDto) {
    // / 配置代理
    const privateKey = process.env.NODE_PRIVATEKEY;

    // const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7890'); // 使用与 curl 相同的代理地址
    const openai = new OpenAI({
      apiKey: privateKey,
      // httpAgent: proxyAgent,
    });

    try {
      // 判断是否为英文（只包含字母、数字、空格和常见标点）

      const isEnglish = isPureEnglish(createCreatDto.prompt);
      console.log('Is English:', isEnglish);

      if (!isEnglish) {
        // 如果不是英文
        const rs = await translateToEnglish(createCreatDto.prompt);
        console.log(rs, 'rsrsrsrs');
        createCreatDto.prompt = rs;
      }

      // 调用 OpenAI 文生图 API
      const result = await openai.images.generate({
        model: 'dall-e-2', // 注意：这里使用正确的模型名称，例如 'dall-e-3'
        prompt: createCreatDto.prompt,
        // quality: createCreatDto.quality as any,
        // size: createCreatDto.size as any,
        response_format: 'b64_json',
      });
      console.log(result);
      // 保存到数据库里
      const creatImg = new this.CreatImgModel({
        prompt: createCreatDto.prompt,
        time: new Date().toLocaleString(), // 本地格式化，如 "2025/5/20 14:53:22"
        image: `data:image/png;base64,${result.data[0].b64_json}`,
        userId: createCreatDto.userId,
      });
      await creatImg.save();

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

  async findAll(userId: string) {
    const data = await this.CreatImgModel.find({ userId }).sort({
      createdAt: -1,
    });
    return {
      code: 200,
      message: '查询成功',
      data,
    };
  }

  async remove(id: string) {
    try {
      const result = await this.CreatImgModel.findByIdAndDelete(id).exec();
      if (!result) {
        return {
          code: 404,
          message: '未找到该图片记录',
        };
      }
      return {
        code: 200,
        message: '删除成功',
        data: result,
      };
    } catch (error) {
      return {
        code: 10001,
        message: '删除失败',
        error,
      };
    }
  }

  async removeAll(): Promise<any> {
    try {
      const result = await this.CreatImgModel.deleteMany({}).exec();
      return {
        code: 200,
        message: '全部图片已删除',
        data: result,
      };
    } catch (error) {
      return {
        code: 10001,
        message: '删除全部失败',
        error,
      };
    }
  }
}
