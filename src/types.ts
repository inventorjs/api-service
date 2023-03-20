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
  config: ApiConfig
}
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
  info: (msg: unknown) => void
  warn: (msg: unknown) => void
  error: (msg: unknown) => void
}

export interface LoggerConfig {
  level?: 'debug' | 'info' | 'warn' | 'error'
  instance?: Logger
}

export interface ApiConfig<D = unknown> extends AxiosRequestConfig<D> {
  $runtime?: Record<string, unknown>
  $apiService?: {
    observe?: 'body' | 'response'
    genReqId?: { (config: ApiConfig): string | number }
    logger?: boolean | LoggerConfig
    urlParams?: Record<string, number | string>
    requestInterceptors?: (typeof RequestInterceptor)[]
    responseInterceptors?: (typeof ResponseInterceptor)[]
    [k: string]: unknown
  }
}

export interface ApiConfigFinal<D = unknown> extends ApiConfig<D> {
  headers: AxiosRequestHeaders
}
