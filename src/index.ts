import { Logger } from '../packages/gj-logger/src/Logger';
import { NextFunction, Request, Response } from 'express';
import * as onFinished from 'on-finished';
import * as util from 'util';
import * as trace from '../trace';

const USE_JSON_FORMAT = process.env.NODE_ENV === 'production';
const logger = new Logger(USE_JSON_FORMAT, process.env.LOG_LEVEL);

const requestLogMessage = (req: Request, res: Response, ms: number) => ({
  httpRequest: {
    remoteIp: req.ip,
    requestUrl: req.originalUrl || req.url,
    requestMethod: req.method,
    status: res.statusCode,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer || req.headers.referrer,
    latency: `${ms.toFixed(3)}ms`,
  },
  query: req.query,
  reqBody: req.body,
  requestTime: ms,
});

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = process.hrtime();

  const logRequest = () => {
    trace.start(req.headers[trace.TRACE_CONTEXT_NAME] as string);
    const diff = process.hrtime(startTime);
    const ms = diff[0] * 1e3 + diff[1] * 1e-6;
    const message = requestLogMessage(req, res, ms);
    if (res.statusCode >= 500) {
      logger.error(req.path, message);
    } else if (res.statusCode >= 400) {
      logger.warn(req.path, message);
    } else {
      logger.info(req.path, message);
    }
  };
  if (req.originalUrl !== '/healthz' && req.originalUrl !== '/readiness') {
    onFinished(res, logRequest);
  }
  next();
};

export const reportError = (err: Error) => {
  const fullError = util.inspect(err, { showHidden: false, depth: null });
  logger.error(err.stack!, { fullError });
};

export default logger;
