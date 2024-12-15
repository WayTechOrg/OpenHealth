import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class GroqAIService {
  private logger = new Logger(GroqAIService.name)
  private baseURL = 'https://api.groq.com/openai/v1'
  private apiKey = process.env.GROQ_API_KEY || ''

  constructor() {
    if (!this.apiKey) {
      this.logger.warn(
        'GROQ_API_KEY is not set. AI analysis will not be available.',
      )
    } else {
      this.logger.log('GROQ_API_KEY is set. AI analysis will be available.')
    }
  }

  async analyze(prompt: string): Promise<string> {
    // console.log('prompt', prompt)
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not set')
    }
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                '你是一个开源项目健康度分析专家，请根据项目信息，分析项目健康度，并给出建议。同时你的回答必须要使用中文。',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      )

      return response.data.choices[0].message.content
    } catch (error) {
      console.error('OpenAI API 调用失败:', error)
      throw error
    }
  }
}
