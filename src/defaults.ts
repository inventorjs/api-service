/**
 * internal defaults
 */
import {
  RuntimeRequestInterceptor,
  RuntimeResponseInterceptor,
} from './interceptors.js'
import { ApiConfig } from './types.js'

export const defaults: ApiConfig = {
  maxRedirects: 0,
  apiServiceRuntime: {},
  apiService: {
    observe: 'body',
    requestInterceptors: [RuntimeRequestInterceptor],
    responseInterceptors: [RuntimeResponseInterceptor],
  },
}
