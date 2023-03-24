/**
 * internal defaults
 */
import {
  RuntimeRequestInterceptor,
  RuntimeResponseInterceptor,
} from './interceptors.js'
import { uuid, isBrowser } from './util.js'

class DefaultLogger {
  static debug(msg: unknown) {
    console.debug.call(this, msg)
  }
  static log(msg: unknown) {
    console.info.call(this, msg)
  }
  static warn(msg: unknown) {
    console.warn.call(this, msg)
  }
  static error(msg: unknown) {
    console.warn.call(this, msg)
  }
}

export const defaults = {
  timeout: 10000,
  maxRedirects: 0,
  $runtime: {},
  $ext: {
    observe: 'body',
    retry: 0,
    genReqId: uuid,
    logger: isBrowser()
      ? false
      : {
          logger: DefaultLogger,
        },
    requestInterceptors: [RuntimeRequestInterceptor],
    responseInterceptors: [RuntimeResponseInterceptor],
  },
}
