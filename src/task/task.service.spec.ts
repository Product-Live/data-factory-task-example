import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { DatafactoryService } from '../datafactory/datafactory.service';
import { TaskService } from './task.service';
import { TaskExecutionDto } from '@product-live/api-sdk';

describe('TaskService', () => {
  let taskService: TaskService;
  let datafactoryService: DatafactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), ScheduleModule.forRoot()],
      providers: [TaskService, DatafactoryService],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    datafactoryService = module.get<DatafactoryService>(DatafactoryService);
  });

  it(
    'execute task',
    async () => {
      const taskInstance: TaskExecutionDto = {
        id: 'taskInstanceId',
        object: 'task_execution',
        createdAt: 'xxx',
        updatedAt: 'xxx',
        input: {
          power: 10,
        },
        output: {},
        status: 'SCHEDULED',
        taskId: 'taskId',
      };
      const fnPollTask = jest
        .spyOn(datafactoryService, 'pollTask')
        .mockResolvedValueOnce(taskInstance);
      const fnPatchTask = jest
        .spyOn(datafactoryService, 'patchTask')
        .mockImplementation();

      await taskService.fetchNextTask();

      expect(fnPollTask).toHaveReturnedTimes(1);
      expect(fnPatchTask).toBeCalledTimes(1);
      expect(fnPatchTask).toBeCalledWith(
        'taskInstanceId',
        'COMPLETED',
        expect.objectContaining({ result: 1024 }),
      );
    },
    60 * 1000,
  );

  it(
    'task execution fails',
    async () => {
      const taskInstance: TaskExecutionDto = {
        id: 'taskInstanceId',
        object: 'task_execution',
        createdAt: 'xxx',
        updatedAt: 'xxx',
        input: {
          power: 'not a number',
        },
        output: {},
        status: 'SCHEDULED',
        taskId: 'taskId',
      };

      const fnPollTask = jest
        .spyOn(datafactoryService, 'pollTask')
        .mockResolvedValueOnce(taskInstance);
      const fnPatchTask = jest
        .spyOn(datafactoryService, 'patchTask')
        .mockImplementation();
      await taskService.fetchNextTask();

      expect(fnPollTask).toHaveReturnedTimes(1);
      expect(fnPatchTask).toBeCalledTimes(1);
      expect(fnPatchTask).toBeCalledWith(
        'taskInstanceId',
        'FAILED',
        expect.objectContaining({}),
      );
    },
    60 * 1000,
  );
});
