import { NextFunction, Request } from 'express';
import * as trace from './';

export const traceMiddleware = (
  traceContextName = trace.getTraceContextName(),
) => (req: Request, _: any, next: NextFunction) => {
  trace.start(req.headers[traceContextName] as string);
  next();
};
