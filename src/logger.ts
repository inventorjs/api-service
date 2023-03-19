/**
 * logger
 */
import { EVENT_REQ_ERROR, EVENT_REQ_FINISH } from './constants.js'
import type {
  ApiConfig,
  Response,
  LoggerConfig,
  ResponseError,
} from './types.js'

export function writeRequestLog({
  config,
  response,
  duration,
  reqId,
  error,
}: {
  config: ApiConfig
  response?: Response
  duration: number
  reqId: string
  error?: ResponseError
}) {
  const loggerConfig = config.$apiService?.logger
  if (!loggerConfig) {
    return
  }

  const logger = (loggerConfig as LoggerConfig)?.instance ?? console
  let level: LoggerConfig['level'] = 'info'

  const url = `${config.baseURL}${config.url}`
  const urlObj = new URL(url)

  const logData = {
    event: EVENT_REQ_FINISH,
    req: {
      id: reqId,
      url,
      method: config.method,
      query: config.params ?? {},
      params: config.$apiService?.urlParams ?? {},
      headers: config.headers,
      pathname: urlObj.pathname,
      body: {},
    },
    res: {
      statusCode: response?.status ?? 0,
      statusText: response?.statusText ?? '',
      headers: response?.headers ?? {},
      body: response?.data ?? {},
    },
    duration,
  }

  if (error) {
    level = 'error'
    Object.assign(logData, {
      event: EVENT_REQ_ERROR,
      err: {
        code: error.code ?? 0,
        message: error.message ?? '',
        stack: error.stack ?? '',
      },
    })
  }

  logger[level](logData)
}
