import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskService } from './task/task.service';
import { DatafactoryService } from './datafactory/datafactory.service';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), HealthModule],
  controllers: [AppController],
  providers: [AppService, TaskService, DatafactoryService],
})
export class AppModule {}
