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
import { uuid } from './util.js'
import { writeRequestLog } from './logger.js'

export class RuntimeRequestInterceptor extends RequestInterceptor {
  static async onFulfilled(config: ApiConfigFinal) {
    const genReqId = config?.$apiService?.genReqId ?? uuid
    const reqId = genReqId(config)
    const startTime = Date.now()
    config.$runtime ??= {}
    config.$runtime.startTime = startTime
    config.$runtime.reqId = reqId
    return config
  }
}

export class RuntimeResponseInterceptor extends ResponseInterceptor {
  static async onFulfilled(response: Response) {
    const config = response.config
    const endTime = Date.now()
    const startTime = (config?.$runtime?.startTime ?? endTime) as number
    const reqId = config?.$runtime?.reqId as string
    const duration = endTime - startTime

    config.$runtime ??= {}
    config.$runtime.endTime = startTime
    config.$runtime.duration = duration

    writeRequestLog({ config, response, reqId, duration })

    return response
  }

  static async onRejected(error: ResponseError) {
    const config = error.config
    const endTime = Date.now()
    const startTime = (config?.$runtime?.startTime ?? endTime) as number
    const reqId = config?.$runtime?.reqId as string
    const response = error.response
    const duration = endTime - startTime

    config.$runtime ??= {}
    config.$runtime.duration = duration

    writeRequestLog({ config, response, reqId, duration, error })

    // return Promise.reject(error)
  }
}
