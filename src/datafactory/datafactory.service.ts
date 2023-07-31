import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ServerConfiguration,
  TaskApi,
  TaskExecutionApi,
  TaskExecutionDto,
  createConfiguration,
} from '@product-live/api-sdk';

@Injectable()
export class DatafactoryService {
  private readonly logger = new Logger(DatafactoryService.name);

  private taskApi: TaskApi;
  private taskExecutionApi: TaskExecutionApi;
  private apiBasePath: string;
  private apiAccessToken: string;

  constructor(configService: ConfigService) {
    const configuration = createConfiguration({
      baseServer: new ServerConfiguration(
        configService.getOrThrow<string>('API_BASE_PATH') || '',
        {},
      ),
      authMethods: {
        ApiKeyAuthHeader: configService.getOrThrow<string>('API_ACCESS_TOKEN'),
      },
    });
    this.taskApi = new TaskApi(configuration);
    this.taskExecutionApi = new TaskExecutionApi(configuration);
    this.apiBasePath = configService.getOrThrow<string>('API_BASE_PATH');
    this.apiAccessToken = configService.getOrThrow<string>('API_ACCESS_TOKEN');
  }

  async pollTask(taskDefinitionId: string): Promise<TaskExecutionDto> {
    try {
      const response = await this.taskApi.pollTaskExecution(taskDefinitionId);
      return response;
    } catch (error) {
      this.logger.warn(
        `No task available, waiting... (API response: ${error?.toString()})`,
      );
    }
  }

  async patchTask(taskId: string, status: any, output: any) {
    await this.taskExecutionApi.patchTaskExecution(taskId, {
      id: taskId,
      output,
      status,
    });
  }
}
