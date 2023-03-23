/**
 * core logic
 */
import type { ClassType, ApiConfig, Instance } from './types.js'
import axios from 'axios'
import { defer, lastValueFrom, retry, timer } from 'rxjs'
import { mergeConfig, processFinalConfig } from './util.js'
import { CONFIG_META, INSTANCE_META } from './constants.js'
import { defaults } from './defaults.js'

export class ApiService {
  private static rcChannelMap = new Map()
  private static inited = false

  static async init({
    services,
    config: rootConfig = {},
  }: {
    services: ClassType<ApiService>[]
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
    this: ClassType<ApiService>,
    data?: D,
    requestConfig: ApiConfig = {},
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
    const mergedConfig = mergeConfig(instanceConfig, requestConfig, { data })
    const finalConfig = processFinalConfig(mergedConfig)

    const genReqId = finalConfig?.$apiService?.genReqId
    const reqId = genReqId?.(finalConfig)
    finalConfig.$runtime ??= {}
    finalConfig.$runtime.reqId = reqId

    const rcChannel = finalConfig.$apiService?.rcChannel
    if (rcChannel) {
      ApiService.rcChannelMap.set(rcChannel, reqId)
    }

    let retryCount = finalConfig.$apiService?.retry
    if (!retryCount || (finalConfig?.method ?? 'get' !== 'get')) {
      retryCount = 0
    }

    if (finalConfig.timeout && typeof AbortSignal !== 'undefined') {
      finalConfig.signal = AbortSignal.timeout(finalConfig.timeout)
      finalConfig.timeout = 0
    }

    const observable = defer(() => instance.request(finalConfig)).pipe(
      retry({
        count: retryCount,
        delay: (_, retryCount) => {
          finalConfig.$runtime ??= {}
          finalConfig.$runtime.retryCount = retryCount
          return timer(Math.min(2 ** retryCount, 30) * 1000)
        },
      }),
    )

    const response = await lastValueFrom(observable)

    if (rcChannel && ApiService.rcChannelMap.get(rcChannel) !== reqId) {
      return new Promise(() => {
        // disccard race condition conflict result
      })
    }

    if (rcChannel) {
      ApiService.rcChannelMap.delete(rcChannel)
    }

    if (finalConfig?.$apiService?.observe === 'response') {
      return response as R
    }
    return response?.data as R
  }
}
