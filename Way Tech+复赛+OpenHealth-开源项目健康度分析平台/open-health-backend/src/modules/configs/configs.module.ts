import { Global, Module } from '@nestjs/common'

import { UserModule } from '../user/user.module'
import { ConfigController } from './config.controller'
import { ConfigsService } from './configs.service'

@Global()
@Module({
  controllers: [ConfigController],
  providers: [ConfigsService],
  imports: [UserModule],
  exports: [ConfigsService],
})
export class ConfigsModule {}
