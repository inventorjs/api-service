/**
 * util
 */
import type {
  ApiConfig,
  ApiConfigFinal,
  LoggerConfig,
  RequestHeaders,
} from './types.js'
import { v4 } from 'uuid'

export function mergeConfig(...configList: ApiConfig[]) {
  const mergedConfig = configList.reduce((result, config) => {
    if (!config) return result

    let baseURL = result.baseURL ?? ''

    if (isRootURL(config.baseURL) || isURL(config.baseURL)) {
      baseURL = config.baseURL ?? ''
    } else {
      baseURL += config.baseURL ?? ''
    }

    const extConfig: ApiConfig['$ext'] = {
      ...(result?.$ext ?? {}),
      ...(config?.$ext ?? {}),
    }

    const headers: RequestHeaders = lowercaseKey<RequestHeaders>({
      ...(result?.headers ?? {}),
      ...(config?.headers ?? {}),
    })
    let logger = result.$ext?.logger ?? {}
    const configLogger = config.$ext?.logger
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

    const requestInterceptors = (result.$ext?.requestInterceptors ?? []).concat(
      config.$ext?.requestInterceptors ?? [],
    )
    const responseInterceptors = (
      result.$ext?.responseInterceptors ?? []
    ).concat(config.$ext?.responseInterceptors ?? [])

    return {
      ...result,
      ...config,
      baseURL,
      headers,
      $ext: {
        ...extConfig,
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
  const extConfig = config.$ext
  if (extConfig?.params && Object.keys(extConfig.params).length > 0) {
    const { params } = extConfig
    Object.keys(params).forEach((key) => {
      url = url?.replace(`:${key}`, String(params[key]))
    })
  }
  return url
}

function processRootUrl(url = '') {
  return url.replace('^', '')
}

export function processConfig(config: ApiConfig, data: unknown) {
  const url = processUrlParams(config)
  const baseURL = processRootUrl(config.baseURL)
  const method = config?.method ? config?.method.toLowerCase() : 'get'
  const params =
    ['get', 'delete'].includes(method) &&
    isObject(data) &&
    Object.keys(data as object).length > 0
      ? data
      : config.params
  let { signal, timeout } = config
  if (!signal && config.timeout && typeof AbortSignal !== 'undefined') {
    signal = AbortSignal.timeout(config.timeout)
    timeout = 0
  }
  let retry = config.$ext?.retry
  if (!retry || config?.method !== 'get') {
    retry = 0
  }

  return [config].reduce((result) => {
    return {
      ...result,
      url,
      baseURL,
      method,
      params,
      signal,
      timeout,
      data,
      $ext: {
        ...config.$ext,
        retry,
      },
    }
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

export function isURL(url = '') {
  return url?.startsWith('http') || url?.startsWith('//')
}

export function isRootURL(url = '') {
  return url.startsWith('^')
}

export function getProtocolURL(url: string) {
  if (url?.startsWith('//')) {
    if (isBrowser()) {
      return `${location.protocol}${url}`
    } else {
      return `http:${url}`
    }
  }
  return url
}

export function getOriginURL(url: string) {
  if (isBrowser()) {
    return `${location.origin}${url}`
  } else {
    return `http://127.0.0.1${url}`
  }
}

export function getFinalURL(config: ApiConfigFinal) {
  const { url = '', baseURL = '' } = config
  if (isURL(url)) {
    return getProtocolURL(url)
  } else {
    if (isURL(baseURL)) {
      return `${getProtocolURL(baseURL)}${url}`
    } else {
      return `${getOriginURL(baseURL)}${url}`
    }
  }
}
