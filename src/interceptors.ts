/**
 * interceptors
 */
import {
  RequestInterceptor,
  ResponseInterceptor,
  Response,
  ResponseError,
  ApiConfigFinal,
} from './types.js'
import { writeLog } from './logger.js'

export class RuntimeRequestInterceptor extends RequestInterceptor {
  async onFulfilled(config: ApiConfigFinal) {
    const reqId = config.$runtime?.reqId as string
    const reqIdHeaderName = config?.$ext?.reqIdHeaderName
    if (reqIdHeaderName) {
      config.headers.set(reqIdHeaderName, reqId)
    }
    const startTime = performance.now()
    config.$runtime ??= {}
    config.$runtime.startTime = startTime
    return config
  }
  async onRejected<T = unknown>(error: T) {
    return Promise.reject(error)
  }
}

export class RuntimeResponseInterceptor extends ResponseInterceptor {
  async onFulfilled(response: Response) {
    const config = response.config
    const endTime = performance.now()
    const reqId = config.$runtime?.reqId as string
    const startTime = config.$runtime?.startTime as number
    const responseTime = Math.round(endTime - startTime)

    writeLog({ config, response, reqId, responseTime })

    return response
  }

  async onRejected(error: ResponseError) {
    const config = error.config
    const endTime = performance.now()
    const reqIdHeaderName = config?.$ext?.reqIdHeaderName as string
    const reqId = config?.headers?.get?.(reqIdHeaderName) as string
    const response = error.response
    const startTime = config.$runtime?.startTime as number
    const responseTime = Math.floor(endTime - startTime)

    writeLog({ config, response, reqId, responseTime, error })

    return Promise.reject(error)
  }
}
