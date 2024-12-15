import { Module } from '@nestjs/common'
import { GroqAIService } from './groqai.service'

@Module({
  providers: [GroqAIService],
  exports: [GroqAIService],
})
export class AIServiceModule {}
