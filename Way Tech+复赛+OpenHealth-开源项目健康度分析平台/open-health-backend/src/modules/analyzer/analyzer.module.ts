import { Module } from '@nestjs/common'
import { AIServiceModule } from '../ai/ai.module'
import { OpenDiggerModule } from '../open-digger/openDigger.module'
import { AIAnalyzerService } from './ai-analyzer.service'
import { AnalyzerController } from './analyzer.controller'
import { AnalyzerService } from './analyzer.service'

@Module({
  imports: [OpenDiggerModule, AIServiceModule],
  controllers: [AnalyzerController],
  providers: [AnalyzerService, AIAnalyzerService],
})
export class AnalyzerModule {}
