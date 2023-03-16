/**
 * internal defaults
 */
import type { ApiConfig } from './types.js'

export const defaults: ApiConfig = {
  timeout: 10000,
  maxContentLength: 10 * 1024,
  maxBodyLength: 10 * 1024,
  withCredentials: true,
  apiService: {
    observe: 'body'
  },
}
