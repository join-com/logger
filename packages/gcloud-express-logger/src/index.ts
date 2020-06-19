import gcloudLogger, { Logger } from '@join-com/gcloud-logger';
import { NextFunction, Request, Response } from 'express';
import onFinished from 'on-finished';

const EXCLUDED_KEYS = ['file', 'resume'];
const requestLogMessage = (req: Request, res: Response, ms: number) => ({
  httpRequest: {
    remoteIp: req.ip,
    requestUrl: req.originalUrl || req.url,
    requestMethod: req.method,
    status: res.statusCode,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer || req.headers.referrer,
    latency: `${ms.toFixed(3)}ms`,
    path: req.route && req.route.path,
  },
  query: req.query,
  reqBody: filterBody(req.body),
  requestTime: ms,
});

const filterBody = (body: any) => {
  Object.keys(body).forEach(key => {
    if (EXCLUDED_KEYS.indexOf(key) !== -1) {
      return '[EXCLUDED]';
    }

    if (typeof body[key] === 'object') {
      filterBody(body[key]);
    }
  });
  return body;
};

export const requestLogger = (
  logger: Logger = gcloudLogger,
  startTrace?: (req: Request) => void,
) => (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();

  const logRequest = () => {
    if (startTrace) {
      startTrace(req);
    }
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

export { NextFunction, Request, Response } from 'express';
export default requestLogger;
