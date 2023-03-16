import 'reflect-metadata'
import axios from 'axios'
import {
  ApiConfig,
  Instance,
  RequestInteceptor,
  ResponseInteceptor,
} from './types.js'
import { mergeConfig } from './util.js'

const CONFIG_META = Symbol('config-meta')
const INSTANCE_META = Symbol('instance-meta')

export * from './types.js'

export async function apiCall<T = unknown>(config: ApiConfig<T> = {}, instance?: Instance) {
  if (config.apiService?.requestInterceptors && instance) {
    config.apiService?.requestInterceptors.forEach(
      ([onFulfilled, onRejected, options]: RequestInteceptor) => {
        instance.interceptors.request.use(onFulfilled, onRejected, options)
      },
    )
  }

  if (config.apiService?.responseInterceptors && instance) {
    config.apiService?.responseInterceptors.forEach(
      ([onFulfilled, onRejected, options]: ResponseInteceptor) => {
        instance.interceptors.response.use(onFulfilled, onRejected, options)
      },
    )
  }

  const res = await instance?.request<T>(config)
  return res?.data
}

export function Service(serviceConfig: ApiConfig) {
  return (Cls: object) => {
    const instance = axios.create(serviceConfig)
    Reflect.defineMetadata(INSTANCE_META, instance, Cls)
    Reflect.defineMetadata(CONFIG_META, serviceConfig, Cls)
  }
}

export function Api(apiConfig: ApiConfig) {
  return (
    Cls: object,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor,
  ) => {
    const context = {
      [propertyKey]: async (requestConfig: ApiConfig) => {
        const serviceConfig = Reflect.getMetadata(CONFIG_META, Cls)
        const instance = Reflect.getMetadata(INSTANCE_META, Cls)
        const mergedConfig = mergeConfig(
          serviceConfig,
          apiConfig,
          requestConfig,
        )
        return apiCall(mergedConfig, instance)
      },
    }

    propertyDescriptor.value = context[propertyKey]
  }
}

export class ApiService {
  private static rootConfig:ApiConfig = {}
  private static inited = false

  static init(rootConfig: ApiConfig) {
    if (this.inited) {
      return
    }
    this.rootConfig = rootConfig
    this.inited = true
  }

  static get config() {
    return this.rootConfig
  }
}
