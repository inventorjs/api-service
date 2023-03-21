# api-service

## Features

- 内部请求使用 [Axios](https://github.com/axios/axios) 实现跨平台请求能力
- 支持 Axios 的所有能力，并进行一定程度的扩展如(retry, race condition, reqId, logger, urlParams 等)
- 采用规范化装饰器 (@Service, @Api) 定义服务与 API，便于对 API 进行统一管理
- 自动将 API 定义转化为服务调用，调用方式与本地函数调用方式相同
- 将 Axios 超时转化为 AbortSignal 处理（axios 内置 timeout 无法处理 node 端连接超时）
- 支持预定义拦截器，可以将拦截器作为配置信息初始化

## Installing

```
// 注：这里用到了 Reflect 的 metadata 相关特性，需要安装其 polyfill
pnpm add @inventorjs/api-service@latest reflect-metadata@latest
```

## Define

### Class

- ApiService: 核心服务类，用于初始化服务，和提供核心接口调用功能，对服务进行初始化
  - init: 初始化所有服务，创建内部请求实例，全局调用一次
- @Service: Service 装饰器，用于提供服务定义信息
- @Api: Api 装饰器，用于提供 api 定义信息

### Types

```
// 提供服务定义配置，可通过 init/@Service/@Api 三个接口传入，并自动进行合并
// 配置合并顺序 defaults -> init -> @Service -> @Api -> apiCall
interface ApiConfig<D = unknown> extends AxiosRequestConfig<D> {
  // 支持所有其他 Axios 配置参数
  $apiService?: {
    observe?: 'body' | 'response' // 选择获取响应对象/响应体(response.data)，默认 response
    rcChannel?: string // race condition channel, 用于解决请求竞态问题，返回最新的数据
    retry?: number // 失败重试次数，默认不重试，默认重试延时：Math.min(2 ** retryCount, 30) * 1000
    reqIdHeaderName?: string // reqId http header，用于再请求头中注入 reqId，默认不住入
    genReqId?: { (config: ApiConfig): string } // reqId 生成算法，默认使用 uuid 算法
    logger?: boolean | LoggerConfig // 日志配置，默认开启(浏览器端默认关闭)
    urlParams?: Record<string, number | string> // url 参数对象，支持如 "/:id" 的url，并进行自动替换
    requestInterceptors?: (typeof RequestInterceptor)[] // 请求拦截器, 注：拦截器只能在 @Service 层级以上配置
    responseInterceptors?: (typeof ResponseInterceptor)[] // 响应拦截器 注：拦截器只能在 @Service 层级以上配置
  }
}

// ApiService 定义
declare class ApiService {
  private static rcChannelMap
  private static inited
  static init({
    services,
    config: rootConfig,
  }: {
    services: Record<string, ClassType<ApiService>>
    config?: ApiConfig
  }): Promise<void>
  static apiCall<R, D = unknown>(
    this: ClassType<ApiService>,
    data?: D,
    config?: ApiConfig,
  ): Promise<unknown>
}

// @Service 定义
declare function Service(
  serviceConfig: ApiConfig,
): (Cls: ClassType<ApiService>) => void

// @Api 定义
declare function Api(
  apiConfig: ApiConfig,
): (
  Cls: ClassType<ApiService>,
  propertyKey: string,
  propertyDescriptor: PropertyDescriptor,
) => void
```

## Example

```
// user.service.ts
import { Service, Api, ApiService, type ApiConfig } from '@inventorjs/api-service'
import { UserService } from './user.service'

@Service({
  baseURL: 'https://api.publicapis.org',
})
export class UserService extends ApiService {
  @Api({ url: '/entries' })
  static entries(data?: unknown, config?: ApiConfig) {
    return this.apiCall<Record<string, unknown>>(data, config)
  }
}

// index.ts 初始化 ApiService
ApiService.init({
  services: { UserService },
  config: {
    timeout: 10000,
    $apiService: {
      observe: 'body',
      retry: 3,
    },
  },
})

// call api somewhere
UserService.entries().then((d) => {
  console.log(d)
})
```
