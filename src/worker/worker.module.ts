
import {Module} from '@nestjs/common';
import {PowerTask} from './power/power.task';

@Module({
    providers: [PowerTask],
    exports: [PowerTask]
})
export class WorkerModule {}
