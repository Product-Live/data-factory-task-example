import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DatafactoryService } from '../datafactory/datafactory.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  private running = false;
  private taskDefinitionId: string;
  private cleanExecutionFolder = true;

  constructor(
    configService: ConfigService,
    private datafactoryService: DatafactoryService,
  ) {
    this.taskDefinitionId =
      configService.getOrThrow<string>('TASK_DEFINITION_ID');
    this.cleanExecutionFolder =
      configService.get<string>('CLEAN_EXECUTION_FOLDER', 'true') === 'true';
  }

  async fetchNextTask() {
    this.logger.debug(`Task poll: ${this.taskDefinitionId}`);
    const taskInstance = await this.datafactoryService.pollTask(
      this.taskDefinitionId,
    );
    if (taskInstance) {
      this.logger.log(`Task fetched: ${taskInstance.id}`);
      this.logger.log(
        `Task input: ${JSON.stringify(taskInstance.input, null, 2)}`,
      );

      try {
        const power =
          taskInstance.input.power || Math.floor(Math.random() * 50) + 1;

        if (isNaN(power)) {
          throw new Error('Invalid power');
        }

        // Compute data
        const data = Math.pow(2, power);

        await this.datafactoryService.patchTask(taskInstance.id, 'COMPLETED', {
          result: data,
        });
      } catch (error) {
        this.logger.error(error, error.stack);
        await this.datafactoryService.patchTask(taskInstance.id, 'FAILED', {
          messsage: 'Computation failed',
        });
      }
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async cron() {
    if (this.running) {
      this.logger.debug('Task in progress');
      return;
    }
    this.running = true;
    await this.fetchNextTask();
    this.running = false;
  }
}
