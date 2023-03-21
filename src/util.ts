/**
 * util
 */
import type { ApiConfig, LoggerConfig, RequestHeaders } from './types.js'
import { v4 } from 'uuid'

export function mergeConfig(...configList: ApiConfig[]) {
  const mergedConfig = configList.reduce((result, config) => {
    if (!config) return result

    const apiService: ApiConfig['$apiService'] = {
      ...(result?.$apiService ?? {}),
      ...(config?.$apiService ?? {}),
    }

    const headers: RequestHeaders = lowercaseKey<RequestHeaders>({
      ...(result?.headers ?? {}),
      ...(config?.headers ?? {}),
    })
    let logger = result.$apiService?.logger ?? {}
    const configLogger = config.$apiService?.logger
    if (isObject(logger) && isObject(configLogger)) {
      logger = {
        ...(logger as LoggerConfig),
        ...(configLogger as LoggerConfig),
      }
    } else {
      if (configLogger === false) {
        logger = configLogger
      }
    }

    const requestInterceptors = (
      result.$apiService?.requestInterceptors ?? []
    ).concat(config.$apiService?.requestInterceptors ?? [])
    const responseInterceptors = (
      result.$apiService?.responseInterceptors ?? []
    ).concat(config.$apiService?.responseInterceptors ?? [])

    return {
      ...result,
      ...config,
      headers,
      $apiService: {
        ...apiService,
        logger,
        requestInterceptors,
        responseInterceptors,
      },
    }
  }, {})
  return mergedConfig
}

function processUrlParams(config: ApiConfig) {
  let url = config?.url ?? ''
  if (
    config.$apiService?.urlParams &&
    Object.keys(config.$apiService.urlParams).length > 0
  ) {
    const { urlParams } = config.$apiService
    Object.keys(urlParams).forEach((key) => {
      url = url?.replace(`:${key}`, String(urlParams[key]))
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

export function lowercaseKey<
  T extends Record<string, unknown> | undefined = Record<string, unknown>,
>(obj: T) {
  if (!obj) return obj
  return Object.keys(obj).reduce((result, key) => {
    return {
      ...result,
      [String(key).toLowerCase()]: obj[key],
    }
  }, {} as T)
}

export function uuid() {
  return v4()
}

export function wrapReturn<T = unknown>(data: T) {
  return [data].reduce((_, data) => data)
}

export function isObject(obj: unknown) {
  return !!obj && typeof obj === 'object'
}

export function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}
