import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

// 定义基础接口
interface BaseResponse<T = any> {
  data: T
  status: number
  message?: string
}

// API 类型定义
interface ApiTypes {
  // App 相关
  'AppController_ping[0]': {
    method: 'GET'
    path: '/ping'
    response: void
  }
  'AppController_ping[1]': {
    method: 'GET'
    path: '/'
    response: void
  }

  // Config 相关
  ConfigController_getConfig: {
    method: 'GET'
    path: '/configs'
    response: any
    requiresAuth: true
  }
  ConfigController_getDefaultConfig: {
    method: 'GET'
    path: '/configs/default'
    response: any
    requiresAuth: true
  }
  ConfigController_getConfigItem: {
    method: 'GET'
    path: '/configs/:key'
    params: { key: string }
    response: any
    requiresAuth: true
  }
  ConfigController_updateConfigItem: {
    method: 'PUT'
    path: '/configs/:key'
    params: { key: string }
    body: any
    response: any
    requiresAuth: true
  }

  // User 相关
  UserController_login: {
    method: 'POST'
    path: '/users/login'
    body: Record<string, any>
    response: any
  }
  UserController_register: {
    method: 'POST'
    path: '/users/register'
    body: Record<string, any>
    response: any
  }
  UserController_getUsers: {
    method: 'GET'
    path: '/users/:id'
    params: { id: string }
    response: any
    requiresAuth: true
  }

  // OpenDigger 相关
  OpenDiggerController_getRepoMetrics: {
    method: 'GET'
    path: '/open-digger/:platform/:owner/:repo'
    params: {
      platform: string
      owner: string
      repo: string
    }
    response: any
  }
  OpenDiggerController_removeRepo: {
    method: 'DELETE'
    path: '/open-digger/:platform/:owner/:repo'
    params: {
      platform: string
      owner: string
      repo: string
    }
    response: any
    requiresAuth: true
  }
  OpenDiggerController_addRepo: {
    method: 'POST'
    path: '/open-digger/repo'
    body: any
    response: any
    requiresAuth: true
  }

  // Analyzer 相关
  AnalyzerController_getProjectHealth: {
    method: 'GET'
    path: '/analyzer/:platform/:owner/:repo/health'
    params: {
      platform: string
      owner: string
      repo: string
    }
    response: any
  }
  AnalyzerController_getProjectHealthAI: {
    method: 'GET'
    path: '/analyzer/:platform/:owner/:repo/health/ai'
    params: {
      platform: string
      owner: string
      repo: string
    }
    response: any
  }
}

const API_CONFIG: Record<keyof ApiTypes, any> = {
  'AppController_ping[0]': { method: 'GET', path: '/ping' },
  'AppController_ping[1]': { method: 'GET', path: '/' },
  ConfigController_getConfig: { method: 'GET', path: '/configs' },
  ConfigController_getDefaultConfig: {
    method: 'GET',
    path: '/configs/default',
  },
  ConfigController_getConfigItem: { method: 'GET', path: '/configs/:key' },
  ConfigController_updateConfigItem: { method: 'PUT', path: '/configs/:key' },
  UserController_login: { method: 'POST', path: '/users/login' },
  UserController_register: { method: 'POST', path: '/users/register' },
  UserController_getUsers: { method: 'GET', path: '/users/:id' },
  OpenDiggerController_getRepoMetrics: {
    method: 'GET',
    path: '/open-digger/:platform/:owner/:repo',
  },
  OpenDiggerController_removeRepo: {
    method: 'DELETE',
    path: '/open-digger/:platform/:owner/:repo',
  },
  OpenDiggerController_addRepo: { method: 'POST', path: '/open-digger/repo' },
  AnalyzerController_getProjectHealth: {
    method: 'GET',
    path: '/analyzer/:platform/:owner/:repo/health',
  },
  AnalyzerController_getProjectHealthAI: {
    method: 'GET',
    path: '/analyzer/:platform/:owner/:repo/health/ai',
  },
}

/**
 * Fetcher类用于处理API请求
 */
class Fetcher {
  private instance: AxiosInstance
  private token: string = ''

  /**
   * 创建Fetcher实例
   * @param baseURL - API基础URL
   */
  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
    })

    // 请求拦截器
    this.instance.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      return config
    })
  }

  /**
   * 设置认证token
   * @param token - JWT token
   */
  setToken(token: string) {
    this.token = token
    return this
  }

  /**
   * 通用请求方法
   * @param operationId - API操作ID
   * @param config - 请求配置
   */
  private async request<T extends keyof ApiTypes>(
    operationId: T,
    config: {
      params?: Record<string, string>
      body?: any
      query?: Record<string, any>
    } = {},
  ): Promise<BaseResponse<ApiTypes[T]['response']>> {
    const apiConfig = API_CONFIG[operationId]
    let url = apiConfig.path

    // 处理路径参数
    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, value)
      })
    }

    const requestConfig: AxiosRequestConfig = {
      method: apiConfig.method,
      url,
      params: config.query,
      data: config.body,
    }

    const response = await this.instance.request(requestConfig)
    return response.data
  }

  /**
   * 健康检查接口
   */
  ping() {
    return this.request('AppController_ping[0]')
  }

  /**
   * 获取配置
   */
  getConfig() {
    return this.request('ConfigController_getConfig')
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig() {
    return this.request('ConfigController_getDefaultConfig')
  }

  /**
   * 获取指定配置项
   * @param key - 配置键名
   */
  getConfigItem(key: string) {
    return this.request('ConfigController_getConfigItem', {
      params: { key },
    })
  }

  /**
   * 用户登录
   * @param data - 登录信息
   */
  login(data: Record<string, any>) {
    return this.request('UserController_login', {
      body: data,
    })
  }

  /**
   * 用户注册
   * @param data - 注册信息
   */
  register(data: Record<string, any>) {
    return this.request('UserController_register', {
      body: data,
    })
  }

  /**
   * 获取仓库指标数据
   * @param platform - 平台
   * @param owner - 仓库所有者
   * @param repo - 仓库名称
   */
  getRepoMetrics(platform: string, owner: string, repo: string) {
    return this.request('OpenDiggerController_getRepoMetrics', {
      params: { platform, owner, repo },
    })
  }

  /**
   * 更新配置项
   * @param key - 配置键名
   * @param data - 配置数据
   */
  updateConfigItem(key: string, data: any) {
    return this.request('ConfigController_updateConfigItem', {
      params: { key },
      body: data,
    })
  }

  /**
   * 获取用户信息
   * @param id - 用户ID
   */
  getUsers(id: string) {
    return this.request('UserController_getUsers', {
      params: { id },
    })
  }

  /**
   * 移除仓库监控
   * @param platform - 平台
   * @param owner - 仓库所有者
   * @param repo - 仓库名称
   */
  removeRepo(platform: string, owner: string, repo: string) {
    return this.request('OpenDiggerController_removeRepo', {
      params: { platform, owner, repo },
    })
  }

  /**
   * 添加仓库监控
   * @param data - 仓库信息
   */
  addRepo(data: any) {
    return this.request('OpenDiggerController_addRepo', {
      body: data,
    })
  }

  /**
   * 获取项目健康度
   * @param platform - 平台
   * @param owner - 仓库所有者
   * @param repo - 仓库名称
   */
  getProjectHealth(platform: string, owner: string, repo: string) {
    return this.request('AnalyzerController_getProjectHealth', {
      params: { platform, owner, repo },
    })
  }

  /**
   * 获取项目健康度AI分析
   * @param platform - 平台
   * @param owner - 仓库所有者
   * @param repo - 仓库名称
   */
  getProjectHealthAI(platform: string, owner: string, repo: string) {
    return this.request('AnalyzerController_getProjectHealthAI', {
      params: { platform, owner, repo },
    })
  }
}

const fetcher = new Fetcher('http://localhost:3333')

// eslint-disable-next-line import/no-default-export
export default fetcher
