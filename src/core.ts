/**
 * core logic
 */
import type { ClassType, ApiConfig, Instance } from './types.js'
import axios from 'axios'
import { mergeConfig, processConfig } from './util.js'
import { CONFIG_META, INSTANCE_META } from './constants.js'
import { defaults } from './defaults.js'

export class ApiService {
  private static inited = false

  static async init({
    services,
    config: rootConfig = {},
  }: {
    services: Record<string, ClassType<ApiService>>
    config?: ApiConfig
  }) {
    if (this.inited) {
      throw new Error('ApiService can only be initialized once!')
    }
    if (!Object.keys(services).length) {
      console.error(
        'There is no service to initialize. please check services config',
      )
      return
    }
    this.inited = true

    Object.values(services).forEach((Srv) => {
      const serviceConfig = Reflect.getMetadata(CONFIG_META, Srv)
      if (!serviceConfig) {
        throw new Error(
          `Service class must decorated by @Service, please check [${Srv}]`,
        )
      }
      const definedConfig = mergeConfig(
        defaults as ApiConfig,
        rootConfig,
        serviceConfig,
      )
      const instance = axios.create(definedConfig)

      if (definedConfig.$apiService?.requestInterceptors) {
        definedConfig.$apiService?.requestInterceptors.forEach(
          (requestInterceptor) => {
            instance.interceptors.request.use(
              requestInterceptor.onFulfilled,
              requestInterceptor.onRejected,
              requestInterceptor.options,
            )
          },
        )
      }

      if (definedConfig.$apiService?.responseInterceptors) {
        definedConfig.$apiService?.responseInterceptors.forEach(
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

  static async apiCall<R, D = unknown>(
    this: ApiService,
    data?: D,
    config: ApiConfig = {},
  ) {
    const instance: Instance = Reflect.getMetadata(INSTANCE_META, this)
    if (!instance) {
      throw new Error(
        `Service instance not exist for ${
          (this as { name: string }).name
        }, service must decorated by @Service`,
      )
    }

    const instanceConfig = instance.defaults as unknown as ApiConfig
    const fullConfig = mergeConfig(instanceConfig, config, { data })
    const requestConfig = processConfig(fullConfig)

    const response = await instance.request(requestConfig)

    if (requestConfig?.$apiService?.observe === 'response') {
      return response as R
    }
    return response?.data as R
  }
}
