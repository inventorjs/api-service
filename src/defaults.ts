/**
 * internal defaults
 */
import {
  RuntimeRequestInterceptor,
  RuntimeResponseInterceptor,
} from './interceptors.js'
import { ApiConfig } from './types.js'

export const defaults: ApiConfig = {
  timeout: 10000,
  maxRedirects: 0,
  $runtime: {},
  $apiService: {
    observe: 'body',
    logger: {
      level: 'info',
      instance: console,
    },
    requestInterceptors: [RuntimeRequestInterceptor],
    responseInterceptors: [RuntimeResponseInterceptor],
  },
}
