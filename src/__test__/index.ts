import {
  Api,
  Service,
  ApiConfig,
  ApiService,
  RequestInterceptor,
} from '../index.js'

@Service({
  // baseURL: 'http://127.0.0.1:8000',
  baseURL: 'http://10.10.10.10',
})
class Test extends ApiService {
  @Api({ url: '/:id' })
  static login(data?: any, config?: ApiConfig<string>) {
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

Test.login('123', { $apiService: { urlParams: { id: 'act' } } })
