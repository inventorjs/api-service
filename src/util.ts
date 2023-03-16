/**
 * 工具函数
 */
import { ApiConfig } from './types.js'

export function mergeConfig(...configList: ApiConfig[]) {
  return configList.reduce((result, config) => {
    const apiService = {...(result.apiService ?? {}), ...(config.apiService ?? {})}
    const requestInterceptors = (
      result.apiService?.requestInterceptors ?? []
    ).concat(config.apiService?.requestInterceptors ?? [])
    const responseInterceptors = (
      result.apiService?.responseInterceptors ?? []
    ).concat(config.apiService?.responseInterceptors ?? [])

    return {
      ...result,
      ...config,
      apiService: {
        ...apiService,
        requestInterceptors,
        responseInterceptors,
      },
    }
  }, {})
}
