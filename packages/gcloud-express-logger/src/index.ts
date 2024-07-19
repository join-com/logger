import { NextFunction, Request, Response } from 'express'
import onFinished from 'on-finished'

const requestLogMessage = (req: Request, res: Response, ms: number) => ({
  httpRequest: {
    remoteIp: req.ip,
    requestUrl: req.originalUrl || req.url,
    requestMethod: req.method,
    status: res.statusCode,
    userAgent: req.headers['user-agent'],
    release: req.headers['release'],
    transactionId: req.headers['transaction-id'],
    transactionName: req.headers['transaction-name'],
    referer: req.headers.referer,
    latency: `${ms.toFixed(3)}ms`,
  },
  query: req.query,
  reqBody: req.body,
  requestTime: ms,
})

const requestOperationName = (req: Request): string | undefined => {
  if ('operationName' in req.body && typeof req.body.operationName === 'string') {
    return req.body.operationName
  }
  return undefined
}

export interface IGcloudLogger {
  info: (message: string, payload?: unknown) => void
  warn: (message: string, payload?: unknown) => void
  error: (message: string, payload?: unknown) => void
}

export const requestLogger =
  (logger: IGcloudLogger) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const startTime = process.hrtime()

    const logRequest = () => {
      const diff = process.hrtime(startTime)
      const ms = diff[0] * 1e3 + diff[1] * 1e-6
      const payload = requestLogMessage(req, res, ms)
      const operationName = requestOperationName(req)
      const message = operationName ? `${req.originalUrl} ${operationName}` : req.originalUrl

      if (res.statusCode >= 500) {
        logger.error(message, payload)
      } else if (res.statusCode >= 400) {
        logger.warn(message, payload)
      } else {
        logger.info(message, payload)
      }
    }
    if (
      req.originalUrl !== '/healthz' &&
      req.originalUrl !== '/readiness' &&
      req.originalUrl !== '/api/healthz' &&
      req.originalUrl !== '/api/readiness'
    ) {
      onFinished(res, logRequest)
    }
    next()
  }
