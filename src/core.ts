/**
 * core logic
 */
import type { ClassType, ApiConfig } from './types.js'
import axios from 'axios'
import { mergeConfig, processUrlParams } from './util.js'
import { CONFIG_META, INSTANCE_META } from './constants.js'
import { defaults } from './defaults.js'

export class ApiService {
  private static inited = false

  static async init({
    services,
    config: rootConfig = {},
  }: {
    services: Record<string, ClassType>
    config?: ApiConfig
  }) {
    if (this.inited) {
      throw new Error('ApiService can only be initialized once!')
    }
    if (!Object.keys(services).length) {
      console.error('There is no service to initialize.')
      return
    }
    this.inited = true

    Object.values(services).forEach((Srv) => {
      const serviceConfig = Reflect.getMetadata(CONFIG_META, Srv) ?? {}
      const definedConfig = mergeConfig(defaults, rootConfig, serviceConfig)
      const instance = axios.create(definedConfig)

      if (definedConfig.apiService?.requestInterceptors && instance) {
        definedConfig.apiService?.requestInterceptors.forEach(
          (requestInterceptor) => {
            instance.interceptors.request.use(
              requestInterceptor.onFulfilled,
              requestInterceptor.onRejected,
              requestInterceptor.options,
            )
          },
        )
      }

      if (definedConfig.apiService?.responseInterceptors && instance) {
        definedConfig.apiService?.responseInterceptors.forEach(
          (responseInterceptor) => {
            instance.interceptors.response.use(
              responseInterceptor.onFulfilled,
              responseInterceptor.onRejected,
              responseInterceptor.options,
            )
          },
        )
      }

      Reflect.defineMetadata(INSTANCE_META, instance, Srv)
    })
  }

  static async apiCall<T>(this: ApiService, config: ApiConfig) {
    const instance = Reflect.getMetadata(INSTANCE_META, this)
    if (!instance) {
      throw new Error(
        `Instance not exist for ${(this as { name: string }).name}`,
      )
    }
    const processedConfig = processUrlParams(config)
    const response = await instance.request(processedConfig)

    if (config.apiService?.observe === 'response') {
      return response as T
    }
    return response.data as T
  }
}