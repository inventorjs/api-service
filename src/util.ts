/**
 * util
 */
import type { ApiConfig, RequestHeaders } from './types.js'
import { HEADER_USER_AGENT } from './constants.js'

export function mergeConfig(...configList: ApiConfig[]) {
  return configList.reduce((result, config) => {
    if (!config) return result

    const apiService = {
      ...(result?.apiService ?? {}),
      ...(config?.apiService ?? {}),
    }

    const headers: RequestHeaders = {
      ...(result?.headers ?? {}),
      ...(config?.headers ?? {}),
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

function processHeaders(config: ApiConfig) {
  let headers = config?.headers ?? {}
  if (config.apiService?.userAgent) {
    headers = { ...headers, [HEADER_USER_AGENT]: config.apiService.userAgent }
  }

  return headers
}

export function processConfig(config: ApiConfig) {
  const url = processUrlParams(config)
  const headers = processHeaders(config)
  return [config].reduce((result) => {
    return { ...result, url, headers }
  }, config)
}
