import { Api, Service, apiCall, ApiConfig } from '../index.js'

@Service({
  baseURL: 'https://www.baidu.com'
})
class Test {
  @Api({ url: '/' })
  static login(config: ApiConfig<string>) {
    return apiCall<string>(config)
  }
}

Test.login({ data: 'hello' }).then((d) => console.log(d))
