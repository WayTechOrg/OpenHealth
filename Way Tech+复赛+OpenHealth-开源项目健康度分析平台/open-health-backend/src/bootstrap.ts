import { ValidationPipe } from '@nestjs/common'

import { NestFactory } from '@nestjs/core'
import { Logger } from 'nestjs-pretty-logger'

import chalk from 'picocolors'

import { CROSS_DOMAIN, PORT } from './app.config'
import { AppModule } from './app.module'
import { fastifyApp } from './common/adapter/fastify.adapter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { logger } from './global/consola.global'
import { isDev } from './utils/environment.utils'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'

const APIVersion = '1.0.0'
const Origin = CROSS_DOMAIN.allowedOrigins

declare const module: any

export async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyApp,
    { logger: ['error', 'debug'] },
  )

  const hosts = Origin.map((host) => new RegExp(host, 'i'))

  app.enableCors({
    origin: (origin, callback) => {
      const allow = hosts.some((host) => host.test(origin))

      callback(null, allow)
    },
    credentials: true,
  })

  !isDev && app.setGlobalPrefix(`api`)
  isDev && app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: 422,
      forbidUnknownValues: true,
      enableDebugMessages: isDev,
      stopAtFirstError: true,
    }),
  )

  if (isDev) {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger')
    const options = new DocumentBuilder()
      .setTitle('OpenHealth API')
      .setDescription('OpenHealth API 文档')
      .setVersion(String(APIVersion))
      .addSecurity('bearer', {
        type: 'http',
        scheme: 'bearer',
      })
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('api-docs', app, document)
  }

  await app.listen(+PORT, '0.0.0.0', async (_err, _address) => {
    Logger.setLoggerInstance(logger)
    app.useLogger(app.get(Logger))
    consola.info('ENV:', process.env.NODE_ENV)
    const url = await app.getUrl()
    const pid = process.pid

    const prefix = 'P'

    if (isDev) {
      consola.debug(`[${prefix + pid}] OpenApi: ${url}/api-docs`)
    }

    consola.success(`[${prefix + pid}] Server listen on: ${url}`)

    logger.log(`Server is up. ${chalk.yellow(`+${performance.now() | 0}ms`)}`)
  })
  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}
