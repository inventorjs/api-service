/**
 * types
 */
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosInterceptorManager,
  AxiosResponse,
  AxiosError,
  AxiosHeaders,
} from 'axios'

type RequestInteceptorInternal = Parameters<
  AxiosInterceptorManager<ApiConfigFinal>['use']
>
type ResponseInteceptorInternal = Parameters<
  AxiosInterceptorManager<AxiosResponse>['use']
>

export type RequestInteceptorOnFulfilled = RequestInteceptorInternal[0]
export type RequestInteceptorOnRejected = RequestInteceptorInternal[1]
export type RequestInteceptorOptions = RequestInteceptorInternal[2]

export type ResponseInteceptorOnFulfilled = ResponseInteceptorInternal[0]
export type ResponseInteceptorOnRejected = ResponseInteceptorInternal[1]
export type ResponseInteceptorOptions = ResponseInteceptorInternal[2]

export type ClassType<T = unknown> = { new (): T }
export type Instance = AxiosInstance
export type Response<T = unknown, D = unknown> = AxiosResponse<T, D> & {
  config: ApiConfigFinal
}
export type Headers = AxiosHeaders
export type RequestHeaders = AxiosRequestConfig['headers']
export interface ResponseError extends AxiosError {
  config: ApiConfigFinal
}

export abstract class RequestInterceptor {
  static options: RequestInteceptorOptions
  static onFulfilled: RequestInteceptorOnFulfilled
  static onRejected: RequestInteceptorOnRejected
}

export abstract class ResponseInterceptor {
  static options: ResponseInteceptorOptions
  static onFulfilled: ResponseInteceptorOnFulfilled
  static onRejected: ResponseInteceptorOnRejected
}

export interface Logger {
  debug: (msg: unknown) => void
  log: (msg: unknown) => void
  warn: (msg: unknown) => void
  error: (msg: unknown) => void
}

export interface LoggerConfig {
  logger?: Logger
  customEventName?: {
    success?: string
    error?: string
  }
  customAttributeKeys?: {
    event?: string
    req?: string
    res?: string
    err?: string
    responseTime?: string
  }
}

export interface ApiConfig<D = unknown> extends AxiosRequestConfig<D> {
  $runtime?: {
    startTime?: number
    reqId?: string
    [k: string]: unknown
  }
  $apiService?: {
    observe?: 'body' | 'response'
    rcChannel?: string
    retry?: number
    reqIdHeaderName?: string
    genReqId?: { (config: ApiConfig): string }
    logger?: boolean | LoggerConfig
    urlParams?: Record<string, number | string>
    requestInterceptors?: (typeof RequestInterceptor)[]
    responseInterceptors?: (typeof ResponseInterceptor)[]
  }
}

export interface ApiConfigFinal<D = unknown> extends ApiConfig<D> {
  headers: AxiosRequestHeaders
}
