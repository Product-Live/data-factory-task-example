import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatafactoryService } from './datafactory.service';

describe('DatafactoryService', () => {
  let service: DatafactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [DatafactoryService],
    }).compile();

    service = module.get<DatafactoryService>(DatafactoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
