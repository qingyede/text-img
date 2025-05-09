import { Test, TestingModule } from '@nestjs/testing';
import { CreatService } from './creat.service';

describe('CreatService', () => {
  let service: CreatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreatService],
    }).compile();

    service = module.get<CreatService>(CreatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
