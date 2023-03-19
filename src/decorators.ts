/**
 * decorators
 */
import type { ApiConfig, ClassType } from './types.js'
import { CONFIG_META } from './constants.js'
import { mergeConfig } from './util.js'
import { ApiService } from './core.js'

export function Service(serviceConfig: ApiConfig) {
  return (Cls: ClassType<ApiService>) => {
    Reflect.defineMetadata(CONFIG_META, serviceConfig, Cls)
  }
}

export function Api(apiConfig: ApiConfig) {
  return (
    Cls: ClassType<ApiService>,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor,
  ) => {
    const context = {
      [propertyKey]: async (data: unknown, requestConfig: ApiConfig) => {
        const config = mergeConfig(apiConfig, requestConfig)
        return ApiService.apiCall.call(Cls, data, config)
      },
    }
    propertyDescriptor.value = context[propertyKey]
  }
}
