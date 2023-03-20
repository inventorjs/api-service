/**
 * logger
 */
import type {
  Response,
  Logger,
  ResponseError,
  LoggerConfig,
  ApiConfigFinal,
} from './types.js'

type logFun = keyof Logger

export function writeLog({
  config,
  response,
  responseTime,
  reqId,
  error,
}: {
  config: ApiConfigFinal
  response?: Response
  responseTime: number
  reqId: string
  error?: ResponseError
}) {
  const apiService = config.$apiService
  const loggerConfig = apiService?.logger as LoggerConfig

  if (!loggerConfig) {
    return
  }

  const logger = loggerConfig.logger as Logger
  let level: logFun = 'log'

  const url = `${config.baseURL}${config.url}`
  const urlObj = new URL(url)
  const eventKey = loggerConfig?.customAttributeKeys?.event ?? 'event'
  const reqKey = loggerConfig?.customAttributeKeys?.req ?? 'req'
  const resKey = loggerConfig?.customAttributeKeys?.res ?? 'res'
  const responseTimeKey =
    loggerConfig?.customAttributeKeys?.responseTime ?? 'responseTime'
  const eventSuccess = loggerConfig?.customEventName?.success ?? 'api-success'
  const eventError = loggerConfig?.customEventName?.error ?? 'api-error'

  const logData = {
    [eventKey]: eventSuccess,
    [reqKey]: {
      id: reqId,
      url,
      method: config.method,
      query: config.params,
      params: config.$apiService?.urlParams,
      headers: config.headers.toJSON(),
      pathname: urlObj.pathname,
      body: config.data,
    },
    [resKey]: {
      statusCode: response?.status ?? 0,
      statusText: response?.statusText ?? '',
      headers: response?.headers?.toJSON(),
      body: response?.data,
    },
    [responseTimeKey]: responseTime,
  }

  if (error) {
    level = 'error'
    Object.assign(logData, {
      event: eventError,
      err: {
        code: error.code ?? 0,
        message: error.message ?? '',
        stack: error.stack ?? '',
      },
    })
  }

  logger[level](logData)
}
