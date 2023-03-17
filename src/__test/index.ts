import {
  Api,
  Service,
  ApiConfig,
  ApiService,
  RequestInterceptor,
} from '../index.js'

// @Service({
//   baseURL: 'https://cloud.tencent.com',
// })
// class Test extends ApiService {
//   @Api({ url: '/:id' })
//   static login(data?: any, config?: ApiConfig<string>) {
//     return this.apiCall<string>(data, config)
//   }
// }

// ApiService.init({
//   services: { Test },
//   config: {
//     baseURL: 'https://www.baidu.com',
//     apiService: {
//       requestInterceptors: [class interceptor extends RequestInterceptor {}],
//     },
//   },
// })

// Test.login('123', { apiService: { urlParams: { id: 'act' } } }).then((d) =>
//   console.log(d),
// )

import axios from 'axios'

axios.post('http://127.0.0.1:9000', { a: 1})
