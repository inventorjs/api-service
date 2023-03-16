/**
 * util
 */
import type { ApiConfig, RequestHeaders } from './types.js'

export function mergeConfig(...configList: ApiConfig[]) {
  return configList.reduce((result, config) => {
    if (!config) return result

    const apiService = {
      ...(result?.apiService ?? {}),
      ...(config?.apiService ?? {}),
    }

    const headers: RequestHeaders = Object.entries({
      ...(result?.headers ?? {}),
      ...(config?.headers ?? {}),
    }).reduce(
      (result, [key, val]) => ({ ...result, [String(key).toLowerCase()]: val }),
      {},
    )

    const requestInterceptors = (
      result.apiService?.requestInterceptors ?? []
    ).concat(config.apiService?.requestInterceptors ?? [])
    const responseInterceptors = (
      result.apiService?.responseInterceptors ?? []
    ).concat(config.apiService?.responseInterceptors ?? [])

    return {
      ...result,
      ...config,
      headers,
      apiService: {
        ...apiService,
        requestInterceptors,
        responseInterceptors,
      },
    }
  }, {})
}

function processUrlParams(config: ApiConfig) {
  let url = config?.url ?? ''
  if (
    config.apiService?.urlParams &&
    Object.keys(config.apiService.urlParams).length > 0
  ) {
    Object.entries(config.apiService.urlParams).forEach(([key, val]) => {
      url = url?.replace(`:${key}`, String(val))
    })
  }
  return url
}

export function processConfig(config: ApiConfig) {
  const url = processUrlParams(config)
  return [config].reduce((result) => {
    return { ...result, url }
  }, config)
}
