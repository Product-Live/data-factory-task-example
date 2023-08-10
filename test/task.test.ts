
jest.useFakeTimers(); // ES6 specs say imports should be hoisted. Not done currently in TS
import {Test} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {DatafactoryService, DataFactoryTaskResult} from '@product-live/data-factory-nest';
import {WorkerModule} from '../src/worker/worker.module';
import {PowerTask} from '../src/worker/power/power.task';
import {AppModule} from '../src/app.module';

describe('Test task', () => {

    let app: INestApplication;
    let moduleRef: any;
    let close = [];

    beforeEach(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [WorkerModule]
        }).compile();

        app = moduleRef.createNestApplication();
        close.push(app);
        await app.init();
    });

    afterEach(async () => {
        for (const i in close) {
            await close[i].close();
        }
        close= [];
    });

    it('Task should output a valid output', async () => {
        const task = moduleRef.get(PowerTask);
        const out = await task.run({power: 10});
        expect(out.status).toBe('COMPLETED');
        expect(out.data).toStrictEqual({result: 1024});
    });

    it('Task should output NaN if input missing', async () => {
        const task = moduleRef.get(PowerTask);
        const out = await task.run({});
        expect(out.status).toBe('COMPLETED');
        expect(out.data).toStrictEqual({result: NaN});
    });

    it('App should boot and task input validation work', async () => {
        await expect(async () => {
            await Test.createTestingModule({
                imports: [AppModule]
            }).compile();
        }).rejects.toThrow('Configuration key "API_BASE_PATH" does not exist');
        
        process.env = {
            API_ACCESS_TOKEN: 'test',
            API_BASE_PATH: 'http://localhost:3000',
            POLL_INTERVAL: '*/1 * * * * *'
        };
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        const app = moduleRef.createNestApplication();
        close.push(app);
        await app.init();

        const service: any = moduleRef.get(DatafactoryService);
        close.push(service);

        const tasks = {data: [], done: []};
        const spyFetchTask = jest.spyOn(service, 'fetchTask')
            .mockImplementation((task) => {
                expect(task).toBe('replace_me'); // check that the id in task is used
                return tasks.data.splice(0, 1)[0];
            });
        const spyUpdateTask = jest.spyOn(service, 'updateTask')
            .mockImplementation((id, result) => {
                tasks.done.push({id: id, result: result});
            });
        
        tasks.data.push({id: '1', input: {power: 10}})
        jest.advanceTimersByTime(1000);
        await service.waitTaskFinish();
        expect(spyFetchTask).toHaveBeenCalledTimes(1);
        expect(spyUpdateTask).toHaveBeenCalledTimes(1);
        expect(tasks.done[0].id).toBe('1');
        expect(tasks.done[0].result).toBeInstanceOf(DataFactoryTaskResult);
        expect(tasks.done[0].result.status).toBe('COMPLETED');
        expect(tasks.done[0].result.data).toStrictEqual({
            result: 1024
        });

        tasks.data.push({id: '2', input: {power: null}})
        jest.advanceTimersByTime(1000);
        await service.waitTaskFinish();
        expect(spyFetchTask).toHaveBeenCalledTimes(2);
        expect(spyUpdateTask).toHaveBeenCalledTimes(2);
        expect(tasks.done[1].id).toBe('2');
        expect(tasks.done[1].result).toBeInstanceOf(DataFactoryTaskResult);
        expect(tasks.done[1].result.status).toBe('FAILED');
        expect(tasks.done[1].result.data).toStrictEqual({
            message: `Input validation failed: "power: ['power must be a number conforming to the specified constraints']"`
        });
    });

});
