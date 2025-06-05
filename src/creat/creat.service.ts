import { Injectable } from '@nestjs/common';
import { CreateCreatDto } from './dto/create-creat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatImg } from './schemas/creatimg-schema';
import { ExampleImage } from './schemas/example-image.schema';
import OpenAI from 'openai';
// import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class CreatService {
  constructor(
    @InjectModel(CreatImg.name) private CreatImgModel: Model<CreatImg>,
    @InjectModel(ExampleImage.name)
    private ExampleImageModel: Model<ExampleImage>,
  ) {}

  async create(createCreatDto: CreateCreatDto, isUrl = true) {
    if (createCreatDto.type === 'gpt') {
      const privateKey = process.env.NODE_PRIVATEKEY;
      // const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7890');

      const openai = new OpenAI({
        apiKey: privateKey,
        // httpAgent: proxyAgent,
      });

      try {
        // 开始翻译
        const rs = await this.translateToEnglish(createCreatDto.prompt);
        if (rs.code !== 200) {
          return {
            code: 10001,
            message: '翻译失败',
            error: rs,
          };
        } else {
          createCreatDto.prompt = rs.data;
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
      console.log(WAVESPEED_API_KEY, 'WAVESPEED_API_KEY');
      const runModel = async (): Promise<any> => {
        const url = 'https://api.wavespeed.ai/api/v3/wavespeed-ai/flux-dev';
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WAVESPEED_API_KEY}`,
        };
        console.log(createCreatDto.prompt, 'createCreatDto.prompt');
        // 开始翻译
        const rs = await this.translateToEnglish(createCreatDto.prompt);
        console.log(rs);
        if (rs.code !== 200) {
          return {
            code: 10001,
            message: '翻译失败',
            error: rs,
          };
        } else {
          createCreatDto.prompt = rs.data;
        }

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
          enable_base64_output: isUrl,

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
    } else if (createCreatDto.type === 'hidream-i1-full') {
      const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY;

      const runModel = async (): Promise<any> => {
        const url =
          'https://api.wavespeed.ai/api/v3/wavespeed-ai/hidream-e1-full';
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WAVESPEED_API_KEY}`,
        };
        console.log(createCreatDto.prompt, 'createCreatDto.prompt');
        // 开始翻译
        const rs = await this.translateToEnglish(createCreatDto.prompt);
        console.log(rs);
        if (rs.code !== 200) {
          return {
            code: 10001,
            message: '翻译失败',
            error: rs,
          };
        } else {
          createCreatDto.prompt = rs.data;
        }

        const payload = {
          prompt: createCreatDto.prompt,
          image: createCreatDto.img,
          seed: -1,
          enable_base64_output: false,
          enable_safety_checker: true,
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
          image: resultImage,
          userId: createCreatDto.userId,
          url: createCreatDto.img,
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
    } else if (createCreatDto.type === 'Midjourney') {
      console.log(createCreatDto);

      // return false;
      const runMidjourneyModel = async (): Promise<any> => {
        const MIDJOURNEY_API_URL =
          'https://api.acedata.cloud/midjourney/imagine';
        const MIDJOURNEY_API_KEY = process.env.MIDJOURNEY_API_KEY;
        if (createCreatDto.prompt) {
          // 翻译 prompt
          const rs = await this.translateToEnglish(createCreatDto.prompt);
          if (rs.code !== 200) {
            return {
              code: 10001,
              message: '翻译失败',
              error: rs,
            };
          } else {
            createCreatDto.prompt = rs.data;
          }
        }

        console.log(
          createCreatDto.prompt,
          'createCreatDto.promptcreateCreatDto.prompt2',
        );

        const payload = {
          ...(createCreatDto.prompt && {
            prompt: createCreatDto.img
              ? `${createCreatDto.img} ${createCreatDto.prompt} --iw 2`
              : createCreatDto.prompt,
          }),

          ...(createCreatDto.action && { action: createCreatDto.action }),

          ...(createCreatDto.image_id && { image_id: createCreatDto.image_id }),
        };
        console.log(payload, 'payload');

        const headers = {
          Authorization: `Bearer ${MIDJOURNEY_API_KEY}`,
          'Content-Type': 'application/json',
        };

        try {
          const response = await fetch(MIDJOURNEY_API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            console.error(
              `Error: ${response.status}, ${await response.text()}`,
            );
            return null;
          }

          const result = await response.json();
          if (!result.success) {
            console.error('Midjourney API 返回失败:', result);
            return null;
          }

          // 提取图片地址
          // const resultImage = result.raw_image_url || result.image_url;
          const resultImage = result.raw_image_url;
          const image_id = result.image_id;

          return {
            resultImage,
            image_id,
          };
        } catch (error) {
          console.error(`请求 Midjourney 失败: ${error}`);
          return null;
        }
      };

      try {
        const { resultImage, image_id } = await runMidjourneyModel();

        if (!resultImage) {
          return {
            code: 10001,
            message: '图片生成失败',
          };
        }

        const creatImg = new this.CreatImgModel({
          prompt: createCreatDto.prompt,
          time: new Date().toLocaleString(),
          image: resultImage,
          userId: createCreatDto.userId,
        });
        await creatImg.save();

        return {
          code: 200,
          message: '图片生成成功',
          result: resultImage,
          image_id: image_id,
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

  // 翻译成英文

  async translateToEnglish(text: string): Promise<any> {
    try {
      const privateKey = process.env.NODE_PRIVATEKEY;
      // const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7890');
      console.log(text, 'text');
      const openai = new OpenAI({
        apiKey: privateKey,
        // httpAgent: proxyAgent,
      });

      const response = await openai.responses.create({
        model: 'gpt-4.1',
        input: `请将以下内容翻译成英文：${text}，可能会包含多种语言，你可以稍微整合一下翻译让它很通顺，我要用它用生成图片交给大模型，你不必一大堆分析，直接就直接明了的给我最终的翻译句子就行了，记住直接返回翻译后的句子，不必多说什么其他的我的意思是直接翻译`,
      });

      console.log(response.output_text);
      return {
        code: 200,
        msg: '成功',
        data: response.output_text,
      };
    } catch (error) {
      return {
        code: 10001,
        msg: '翻译失败',
        data: error,
      };
    }
  }

  // 生成模型示例图片（promptList + model）
  async creatExampleImg(createCreatDto: any) {
    const { promptList, modelType, userId } = createCreatDto;
    const results = [];

    for (const prompt of promptList) {
      const finalPrompt = prompt; // 不再翻译，直接使用英文 prompt
      let resultImage: string | null = null;

      try {
        switch (modelType) {
          case 'gpt': {
            console.log('gpt生图');
            const privateKey = process.env.NODE_PRIVATEKEY;
            // const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7890');
            const openai = new OpenAI({
              apiKey: privateKey,
              // httpAgent: proxyAgent,
            });

            const result = await openai.images.generate({
              model: 'dall-e-2',
              prompt: finalPrompt,
              response_format: 'url',
            });

            resultImage = result.data[0].url;
            break;
          }

          case 'flux-dev': {
            console.log('flux-dev生图');

            const result = await this.create(
              {
                ...createCreatDto,
                prompt: finalPrompt,
                type: 'flux-dev',
              },
              false,
            );
            resultImage = result?.result;
            break;
          }

          case 'hidream-i1-full': {
            const result = await this.create({
              ...createCreatDto,
              prompt: finalPrompt,
              type: 'hidream-i1-full',
            });
            resultImage = result?.result;
            break;
          }

          case 'Midjourney': {
            console.log('Midjourney生图');

            const result = await this.create({
              ...createCreatDto,
              prompt: finalPrompt,
              type: 'Midjourney',
            });
            resultImage = result?.result;
            break;
          }

          default:
            resultImage = null;
        }
      } catch (err) {
        console.error(`模型调用失败: ${modelType}`, err);
      }

      const doc = new this.ExampleImageModel({
        prompt: finalPrompt,
        modelType: modelType,
        image: resultImage,
        time: new Date().toLocaleString(),
        userId,
      });

      await doc.save();
      results.push(doc);
    }

    return {
      code: 200,
      message: '示例图生成完成',
      results,
    };
  }

  // 查询指定模型生成的所有示例图（可加分页）
  async findImgByModel(model: string) {
    const result = await this.ExampleImageModel.find({
      modelType: model,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return {
      code: 200,
      message: '查询成功',
      data: result,
    };
  }

  // 删除所有示例图片
  async removeAllExampleImg() {
    try {
      // 删除所有 ExampleImageModel 数据
      const result = await this.ExampleImageModel.deleteMany({});

      return {
        code: 200,
        message: '所有示例图片删除成功',
        data: {
          deletedCount: result.deletedCount, // 返回删除的文档数量
        },
      };
    } catch (error) {
      console.error('删除示例图片失败:', error);
      return {
        code: 10001,
        message: '删除示例图片失败',
        error: error.message,
      };
    }
  }
}
