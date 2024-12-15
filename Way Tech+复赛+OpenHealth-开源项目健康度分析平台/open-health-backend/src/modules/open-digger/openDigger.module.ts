import { Module } from '@nestjs/common'
import { OpenDiggerBuilderService } from './openDigger.builder.service'
import { OpenDiggerController } from './openDigger.controller'
import { OpenDiggerSchedulerService } from './openDigger.scheduler.service'
import { OpenDiggerService } from './openDigger.service'

@Module({
  imports: [],
  controllers: [OpenDiggerController],
  providers: [
    OpenDiggerService,
    OpenDiggerBuilderService,
    OpenDiggerSchedulerService,
  ],
  exports: [OpenDiggerService],
})
export class OpenDiggerModule {}
