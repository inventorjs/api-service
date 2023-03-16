/**
 * util
 */
import type { ApiConfig } from './types.js'

export function mergeConfig(...configList: ApiConfig[]) {
  return configList.reduce((result, config) => {
    const apiService = {
      ...(result.apiService ?? {}),
      ...(config.apiService ?? {}),
    }
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
  }, {} as ApiConfig)
}

export function processUrlParams(config: ApiConfig) {
  if (!config) return {}
  let { url } = config
  if (
    config.apiService?.urlParams &&
    Object.keys(config.apiService.urlParams).length > 0
  ) {
    Object.entries(config.apiService.urlParams).forEach(([key, val]) => {
      url = url?.replace(`:${key}`, String(val)) 
    })
  }
  if (url !== config.url) {
    return { ...config, url }
  }
  return config
}
