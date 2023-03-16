/**
 * types
 */
import type {
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosRequestConfig,
  AxiosInterceptorManager,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
type RequestInteceptorInternal = Parameters<
  AxiosInterceptorManager<InternalAxiosRequestConfig>['use']
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

export type ClassType = { new (): void }
export type Instance = AxiosInstance
export type Response<T = unknown, D = unknown> = AxiosResponse<T, D>

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

export interface ApiConfig<D = unknown> extends AxiosRequestConfig<D> {
  headers?: AxiosRequestHeaders;
  apiService?: {
    observe?: 'body' | 'response',
    urlParams?: Record<string, number | string>
    requestInterceptors?: (typeof RequestInterceptor)[]
    responseInterceptors?: (typeof ResponseInterceptor)[]
    [k: string]: unknown
  }
}
