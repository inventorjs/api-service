import {
  Api,
  Service,
  ApiConfig,
  ApiService,
  RequestInterceptor,
} from '../index.js'

@Service({
  baseURL: 'https://cloud.tencent.com',
})
class Test extends ApiService {
  @Api({ url: '/:id' })
  static login(data?: unknown, config?: ApiConfig<string>) {
    return this.apiCall<string>(data, config)
  }
}

ApiService.init({
  services: { Test },
  config: {
    baseURL: 'https://www.baidu.com',
    $apiService: {
      requestInterceptors: [class interceptor extends RequestInterceptor {}],
    },
  },
})

Test.login('123', {
  $apiService: {
    urlParams: { id: 'act' },
    reqIdHeaderName: 'x-req-id',
    retry: 0,
    rcChannel: 'act',
  },
})
Test.login('123', {
  $apiService: {
    urlParams: { id: 'act' },
    reqIdHeaderName: 'x-req-id',
    retry: 0,
    rcChannel: 'act',
  },
})
