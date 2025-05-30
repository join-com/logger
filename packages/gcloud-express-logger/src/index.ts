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
  if (req.body && 'operationName' in req.body && typeof req.body.operationName === 'string') {
    return req.body.operationName
  }

  if (req.originalUrl.endsWith('graphql') && 'query' in req.body && typeof req.body.query === 'string') {
    const query = req.body.query as string
    const match = query.match(/\s*(query|mutation)\s+(\w+)/)
    return match ? match[2] : undefined
  }

  return undefined
}

export interface IGcloudLogger {
  info: (message: string, payload?: unknown) => void
  warn: (message: string, payload?: unknown) => void
  error: (message: string, payload?: unknown) => void
}

export const requestLogger =
  (
    logger: IGcloudLogger,
    options: {
      logExtraFields?: (req: Request, res: Response) => Record<string, unknown>
      extractOperationName?: boolean
    } = {},
  ) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const startTime = process.hrtime()

    const logRequest = () => {
      const diff = process.hrtime(startTime)
      const ms = diff[0] * 1e3 + diff[1] * 1e-6
      const extraFields = options.logExtraFields ? options.logExtraFields(req, res) : {}
      const payload = { ...requestLogMessage(req, res, ms), ...extraFields }
      const operationName = options.extractOperationName ? requestOperationName(req) : undefined
      const message =
        operationName && !req.originalUrl.includes(operationName)
          ? `${req.originalUrl} ${operationName}`
          : req.originalUrl

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
