import { Injectable } from '@nestjs/common';
import { CreateCreatDto } from './dto/create-creat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatImg } from './schemas/creatimg-schema';
import OpenAI from 'openai';
import { translateToEnglish } from './api/index';
import { isPureEnglish } from '@/hook/common/isPureEnglish';
import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class CreatService {
  constructor(
    @InjectModel(CreatImg.name) private CreatImgModel: Model<CreatImg>,
  ) {}

  async create(createCreatDto: CreateCreatDto) {
    if (createCreatDto.type === 'gpt') {
      const privateKey = process.env.NODE_PRIVATEKEY;
      const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7890');

      const openai = new OpenAI({
        apiKey: privateKey,
        httpAgent: proxyAgent,
      });

      try {
        const isEnglish = isPureEnglish(createCreatDto.prompt);
        if (!isEnglish) {
          const rs = await translateToEnglish(createCreatDto.prompt);
          createCreatDto.prompt = rs;
        }

        const result = await openai.images.generate({
          model: 'dall-e-2', // 或 'dall-e-3' 根据需要切换
          prompt: createCreatDto.prompt,
          response_format: 'b64_json',
        });

        const creatImg = new this.CreatImgModel({
          prompt: createCreatDto.prompt,
          time: new Date().toLocaleString(),
          image: `data:image/png;base64,${result.data[0].b64_json}`,
          userId: createCreatDto.userId,
        });
        await creatImg.save();

        return {
          code: 200,
          message: '图片生成成功',
          result,
        };
      } catch (error) {
        return {
          code: 10001,
          message: '图片生成失败',
          error,
        };
      }
    } else if (createCreatDto.type === 'flux-dev') {
      const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY;

      const runModel = async (): Promise<string | null> => {
        const url = 'https://api.wavespeed.ai/api/v3/wavespeed-ai/flux-dev';
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WAVESPEED_API_KEY}`,
        };
        const payload = {
          // 提示词：
          prompt: createCreatDto.prompt,

          // 强度：设置为 0.9，增加提示词对生成图像的影响，适合纯文本生成（无参考图像）。
          // 可用值：0.00 ~ 1.00，值越大越偏向提示词描述。
          strength: createCreatDto.strength,

          // 图像尺寸：选择更高分辨率 1280x1280 以获得更精细的细节。
          // 可用值：512 ~ 1536（每维度），格式为“宽度*高度”。
          size: createCreatDto.size,

          // 推理步骤数：设置为 50，最大化图像质量，适合高质量生成场景。
          // 可用值：1 ~ 50，值越大图像越精细但耗时更长。
          num_inference_steps: createCreatDto.num_inference_steps,

          // 引导尺度：设置为 7.0，增强模型对提示词的遵循程度，生成更贴合描述的图像。
          // 可用值：1.0 ~ 10.0，值越大越严格遵循提示词。
          guidance_scale: createCreatDto.guidance_scale,

          // 是否启用 Base64 输出：设置为 true，返回 Base64 编码图像，适合需要直接处理图像数据的场景。
          // 可用值：true 或 false。false 时返回 URL。
          enable_base64_output: true,

          // 是否启用安全检查：设置为 true，启用安全检查器以过滤不适当内容。
          // 可用值：true 或 false。建议公开场景中启用。
          enable_safety_checker: createCreatDto.enable_safety_checker,
        };

        console.log(JSON.stringify(payload));

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            console.error(
              `Error: ${response.status}, ${await response.text()}`,
            );
            return null;
          }

          const result = await response.json();
          const requestId = result.data.id;

          while (true) {
            const pollRes = await fetch(
              `https://api.wavespeed.ai/api/v3/predictions/${requestId}/result`,
              {
                headers: {
                  Authorization: `Bearer ${WAVESPEED_API_KEY}`,
                },
              },
            );

            const pollJson = await pollRes.json();
            if (!pollRes.ok) {
              console.error('Error:', pollRes.status, JSON.stringify(pollJson));
              return null;
            }

            const status = pollJson.data.status;

            if (status === 'completed') {
              console.log(pollJson.data.outputs[0]);
              return pollJson.data.outputs[0]; // base64 或 URL，依据你的设置
            } else if (status === 'failed') {
              console.error('Task failed:', pollJson.data.error);
              return null;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Request failed: ${error}`);
          return null;
        }
      };

      try {
        const resultImage = await runModel();

        if (!resultImage) {
          return {
            code: 10001,
            message: '图片生成失败',
          };
        }

        const creatImg = new this.CreatImgModel({
          prompt: createCreatDto.prompt,
          time: new Date().toLocaleString(),
          image: resultImage.startsWith('data:')
            ? resultImage
            : `data:image/png;base64,${resultImage}`,
          userId: createCreatDto.userId,
        });
        await creatImg.save();

        return {
          code: 200,
          message: '图片生成成功',
          result: resultImage,
        };
      } catch (error) {
        return {
          code: 10001,
          message: '图片生成异常',
          error,
        };
      }
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
