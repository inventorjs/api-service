import {
  Api,
  Service,
  ApiConfig,
  ApiService,
  RequestInterceptor,
  type Response,
} from '../src/index.js'

@Service({
  baseURL: 'https://cloud.tencent.com',
})
class Test extends ApiService {
  @Api({ url: '/:id' })
  static login<T = string>(config: ApiConfig<string>) {
    return this.apiCall<T>(config)
  }
}

ApiService.init({
  services: { Test },
  config: {
    baseURL: 'https://www.baidu.com',
    apiService: {
      requestInterceptors: [class interceptor extends RequestInterceptor {

      }]
    },
  },
})

Test.login<Response<string>>({
  data: 'hello',
  apiService: { observe: 'response', urlParams: { id: 'act' } },
}).then((d) => console.log(d))
