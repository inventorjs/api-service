import { Api, Service, ApiConfig, ApiService } from '../index.js'

@Service({
  baseURL: 'https://api.publicapis.org',
})
export class UserService extends ApiService {
  @Api({ url: '/entries' })
  static entries(data?: unknown, config?: ApiConfig) {
    return this.apiCall<Record<string, unknown>>(data, config)
  }
}

// 初始化 ApiService
ApiService.init({
  services: { UserService },
  config: {
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
