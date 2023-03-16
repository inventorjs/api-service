/**
 * 类型定义文件
 */
import {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosInterceptorManager,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

export type RequestInteceptor = Parameters<
  AxiosInterceptorManager<InternalAxiosRequestConfig>['use']
>
export type ResponseInteceptor = Parameters<
  AxiosInterceptorManager<AxiosResponse>['use']
>

export type Instance = AxiosInstance

export interface ApiConfig<D = unknown> extends AxiosRequestConfig<D> {
  apiService?: {
    retry?: number
    requestInterceptors?: RequestInteceptor[]
    responseInterceptors?: ResponseInteceptor[]
    [k: string]: unknown
  }
}
