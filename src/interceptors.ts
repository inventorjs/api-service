/**
 * interceptors
 */

// {
  // "level": "info",
  // "time": 1679037256548,
  // "pid": 353077,
  // "hostname": "VM-64-230-centos",
  // "reqId": "9bb7a07639fa411ca3f2e76a4caf2cd7",
  // "req": {
    // "id": "9bb7a07639fa411ca3f2e76a4caf2cd7",
    // "method": "GET",
    // "url": "/developer/login",
    // "query": {},
    // "params": { "0": "developer/login" },
    // "headers": {
      // "host": "127.0.0.1:3000",
      // "connection": "keep-alive",
      // "pragma": "no-cache",
      // "cache-control": "no-cache",
      // "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Google Chrome\";v=\"110\"",
      // "sec-ch-ua-mobile": "?0",
      // "sec-ch-ua-platform": "\"macOS\"",
      // "upgrade-insecure-requests": "1",
      // "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      // "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      // "sec-fetch-site": "none",
      // "sec-fetch-mode": "navigate",
      // "sec-fetch-user": "?1",
      // "sec-fetch-dest": "document",
      // "accept-encoding": "gzip, deflate, br",
      // "accept-language": "en,zh-CN;q=0.9,zh;q=0.8",
      // "cookie": "MicrosoftApplicationsTelemetryDeviceId=46b2f55b-25ff-41b6-b491-5426f26d61ab; MicrosoftApplicationsTelemetryFirstLaunchTime=2023-02-15T06:17:16.064Z; MicrosoftApplicationsTelemetryDeviceId=46b2f55b-25ff-41b6-b491-5426f26d61ab; MicrosoftApplicationsTelemetryFirstLaunchTime=2023-02-15T06:17:16.064Z"
    // },
    // "remoteAddress": "::ffff:127.0.0.1",
    // "remotePort": 33098,
    // "pathname": "/developer/login",
    // "body": {}
  // },
  // "res": {
    // "statusCode": 200,
    // "headers": {
      // "x-powered-by": "Express",
      // "content-type": "application/json; charset=utf-8",
      // "content-length": "2",
      // "etag": "W/\"2-l9Fw4VUO7kr8CvBlt4zaMCqXZ0w\""
    // },
    // "body": {}
  // },
  // "responseTime": 15,
  // "event": "req-finish",
  // "msg": "request completed"
// }

import {
  RequestInterceptor,
  ResponseInterceptor,
  Response,
  ApiConfigFinal,
} from './types.js'

export class RuntimeRequestInterceptor extends RequestInterceptor {
  static async onFulfilled(config: ApiConfigFinal) {
    const startTime = Date.now()
    if (!config.apiServiceRuntime) {
      config.apiServiceRuntime = {}
    }
    config.apiServiceRuntime.startTime = startTime
    return config
  }
}

export class RuntimeResponseInterceptor extends ResponseInterceptor {
  static async onFulfilled(response: Response) {
    const endTime = Date.now()
    const startTime = (response?.config?.apiServiceRuntime?.startTime ?? endTime) as number
    const responseTime = endTime - startTime
    const config = response.config
    const url = `${config.baseURL}${config.url}` 
    const urlObj = new URL(url)
    const logger = {
      req: {
        id: "9bb7a07639fa411ca3f2e76a4caf2cd7",
        url,
        method: config.method,
        query: config.params,
        params: config.apiService?.urlParams, 
        headers: config.headers,
        remoteAddress: response.request?.socket?.remoteAddress,
        remotet: response.request?.socket?.remotePort,
        pathname: urlObj.pathname,
        body: {}
      },
      res: {
        statusCode: response.status,
        headers: response.headers,
        body: response.data
      },
      responseTime,
    }

    console.log(logger)

    return response
  }
  static async onRejected(err: unknown) {
    return Promise.reject(err)
  }
}
