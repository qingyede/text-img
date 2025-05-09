import { Test, TestingModule } from '@nestjs/testing';
import { CreatController } from './creat.controller';
import { CreatService } from './creat.service';

describe('CreatController', () => {
  let controller: CreatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreatController],
      providers: [CreatService],
    }).compile();

    controller = module.get<CreatController>(CreatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
