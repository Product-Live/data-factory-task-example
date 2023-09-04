
import {Injectable, Logger} from '@nestjs/common';
import {TaskRunner, DataFactoryTaskResult} from '@product-live/data-factory-nest';
import {PowerTaskInput, PowerTaskOutput} from './power.input';

@Injectable()
export class PowerTask implements TaskRunner<PowerTaskInput, PowerTaskOutput> {

    private readonly logger = new Logger(PowerTask.name);
    readonly taskDefinitionId = 'replace_me';
    readonly taskInput = PowerTaskInput;

    async run(input: PowerTaskInput, workDirectory: string): Promise<DataFactoryTaskResult<PowerTaskOutput>> {
        this.logger.log({msg: 'started Power task', input: input});
        return new DataFactoryTaskResult<PowerTaskOutput>()
            .setResult({
                result: Math.pow(2, input.power)
            });
    }

}
