import { Api, Service, ApiConfig, ApiService } from '../index.js'

@Service({
  baseURL: 'https://run.mocky.io/v3',
})
export class UserService extends ApiService {
  @Api({ url: '/d7389eca-12e9-4e0e-b55e-4704fe7cbfc4' })
  static getData(data?: void, config?: ApiConfig) {
    return this.apiCall<Record<string, unknown>>(data, config)
  }
}

// 初始化 ApiService
ApiService.init({
  services: [UserService],
  config: {
    $apiService: {
      reqIdHeaderName: 'x-req-id',
      observe: 'body',
      retry: 3,
    },
  },
})

// call api somewhere
UserService.getData().then((data) => {
  console.log('data:', data)
})
