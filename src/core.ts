/**
 * core logic
 */
import type { ClassType, ApiConfig, Instance } from './types.js'
import axios from 'axios'
import { defer, lastValueFrom, retry, timer } from 'rxjs'
import { mergeConfig, processConfig } from './util.js'
import { CONFIG_META, INSTANCE_META } from './constants.js'
import { defaults } from './defaults.js'

export class ApiService {
  private static rcChannelMap = new Map()
  private static inited = false

  static async init({
    services,
    config: rootConfig = {},
  }: {
    services: Record<string, ClassType<ApiService>>
    config?: ApiConfig
  }) {
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
      const extConfig = definedConfig.$ext

      if (extConfig?.requestInterceptors) {
        extConfig?.requestInterceptors.forEach((RequestInterceptor) => {
          const requestInterceptor = new RequestInterceptor()
          instance.interceptors.request.use(
            requestInterceptor.onFulfilled,
            requestInterceptor.onRejected,
            requestInterceptor.options,
          )
        })
      }

      if (extConfig?.responseInterceptors) {
        extConfig?.responseInterceptors.forEach((ResponseInterceptor) => {
          const responseInterceptor = new ResponseInterceptor()
          instance.interceptors.response.use(
            responseInterceptor.onFulfilled,
            responseInterceptor.onRejected,
            responseInterceptor.options,
          )
        })
      }

      Reflect.defineMetadata(INSTANCE_META, instance, Srv)
    })
  }

  static async apiCall<R = unknown, D = unknown>(
    this: ClassType<ApiService>,
    data?: D,
    requestConfig: ApiConfig = {},
  ): Promise<R> {
    const instance: Instance = Reflect.getMetadata(INSTANCE_META, this)
    if (!instance) {
      throw new Error(
        `Service instance not exist for ${
          (this as { name: string }).name
        }, service must decorated by @Service`,
      )
    }

    const instanceConfig = instance.defaults as unknown as ApiConfig
    const mergedConfig = mergeConfig(instanceConfig, requestConfig)
    const config = processConfig(mergedConfig, data)

    const extConfig = config.$ext
    const genReqId = extConfig?.genReqId
    const reqId = genReqId?.(config)
    config.$runtime ??= {}
    config.$runtime.reqId = reqId

    const rcChannel = extConfig?.rcChannel
    if (rcChannel) {
      ApiService.rcChannelMap.set(rcChannel, reqId)
    }

    const stream$ = defer(() => instance.request(config)).pipe(
      retry({
        count: extConfig?.retry ?? 0,
        delay: (_, retryCount) => {
          config.$runtime ??= {}
          config.$runtime.retryCount = retryCount
          return timer(Math.min(2 ** retryCount, 30) * 1000)
        },
      }),
    )

    const response = await lastValueFrom(stream$)

    if (rcChannel && ApiService.rcChannelMap.get(rcChannel) !== reqId) {
      return new Promise(() => {
        // disccard race condition conflict result
      })
    }

    if (rcChannel) {
      ApiService.rcChannelMap.delete(rcChannel)
    }

    if (extConfig?.observe === 'response') {
      return response as R
    }
    return response?.data as R
  }
}
