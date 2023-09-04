
import {Module} from '@nestjs/common';
import {DataFactoryModule} from '@product-live/data-factory-nest';
import {WorkerModule} from './worker/worker.module';
import {PowerTask} from './worker/power/power.task';

@Module({
    imports: [
        WorkerModule,
        DataFactoryModule.forRootAsync({
            imports: [WorkerModule],
            tasks: [PowerTask]
        })
    ],
    providers: []
})
export class AppModule {}
