import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { isDev } from './utils/environment.utils'
import type { AxiosRequestConfig } from 'axios'

const argv = yargs(hideBin(process.argv)).argv as Record<string, unknown>

console.log(argv)
export const PORT = argv.port || 3333
export const CROSS_DOMAIN = {
  allowedOrigins: ['localhost:5173', '192.168.8.10:5173'],
  allowedReferer: '',
}

export const MONGO_DB = {
  dbName: argv.collection_name || 'openhealth-backend',
  host: argv.db_host || '127.0.0.1',
  port: argv.db_port || 27017,
  get uri() {
    return `mongodb://${this.host}:${this.port}/${
      process.env.TEST ? 'nest_unitest' : this.dbName
    }`
  },
}

export const REDIS = {
  host: argv.redis_host || 'localhost',
  port: argv.redis_port || 6379,
  password: argv.redis_password || null,
  ttl: null,
  httpCacheTTL: 5,
  max: 5,
  disableApiCache:
    (isDev || argv.disable_cache) && !process.env.ENABLE_CACHE_DEBUG,
}
export const SECURITY = {
  jwtSecret: argv.jwtSecret || 'asjhczxiucipoiopiqm2376',
  jwtExpire: '7d',
}

export const AXIOS_CONFIG: AxiosRequestConfig = {
  timeout: 10000,
}
