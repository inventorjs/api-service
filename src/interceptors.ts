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
import { getReqIdHeaderName, getReqStartHeaderName } from './util.js'
import { writeLog } from './logger.js'

export class RuntimeRequestInterceptor extends RequestInterceptor {
  static async onFulfilled(config: ApiConfigFinal) {
    const genReqId = config?.$apiService?.genReqId
    const reqId = genReqId?.(config)
    const startTime = Date.now()
    config.headers.set(getReqIdHeaderName(config), reqId)
    config.headers.set(getReqStartHeaderName(config), startTime)
    return config
  }
}

export class RuntimeResponseInterceptor extends ResponseInterceptor {
  static async onFulfilled(response: Response) {
    const config = response.config
    const endTime = Date.now()
    const reqId = config.headers.get(getReqIdHeaderName(config)) as string
    const startTime = config.headers.get(
      getReqStartHeaderName(config),
    ) as number
    const responseTime = endTime - startTime

    writeLog({ config, response, reqId, responseTime })

    return response
  }

  static async onRejected(error: ResponseError) {
    const config = error.config
    const endTime = Date.now()
    const reqId = config.headers.get(getReqIdHeaderName(config)) as string
    const startTime = config.headers.get(
      getReqStartHeaderName(config),
    ) as number
    const response = error.response
    const responseTime = endTime - startTime

    writeLog({ config, response, reqId, responseTime, error })

    return Promise.reject(error)
  }
}
