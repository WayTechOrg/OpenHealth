import { Module } from '@nestjs/common'

import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'

import { LoggerModule } from 'nestjs-pretty-logger'
import { AppController } from './app.controller'
import { AllExceptionsFilter } from './common/filters/any-exception.filter'
import { HttpCacheInterceptor } from './common/interceptors/cache.interceptor'
import { JSONTransformerInterceptor } from './common/interceptors/json-transformer.interceptor'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { AnalyzerModule } from './modules/analyzer/analyzer.module'
import { ConfigsModule } from './modules/configs/configs.module'
import { OpenDiggerModule } from './modules/open-digger/openDigger.module'
import { UserModule } from './modules/user/user.module'
import { CacheModule } from './processors/cache/cache.module'
import { DatabaseModule } from './processors/database/database.module'
import { HelperModule } from './processors/helper/helper.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),

    CacheModule,
    DatabaseModule,
    HelperModule,
    ConfigsModule,

    LoggerModule,
    UserModule,

    OpenDiggerModule,
    AnalyzerModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor, // 3
    },

    {
      provide: APP_INTERCEPTOR,
      useClass: JSONTransformerInterceptor, // 2
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor, // 1
    },

    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
