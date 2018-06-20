import * as expressLogger from '@join-com/gcloud-express-logger';
import { Logger } from '@join-com/gcloud-logger';
import { SqlLogger } from '@join-com/gcloud-typeorm-logger';
import * as trace from '@join-com/node-trace';

const TRACE_CONTEXT_NAME = 'x-cloud-trace-context';
const USE_JSON_FORMAT = process.env.NODE_ENV === 'production';

export const logger = new Logger(
  USE_JSON_FORMAT,
  process.env.LOG_LEVEL,
  trace.getTraceContext,
);

export const newSqlLogger = (logQueries: boolean = false) =>
  new SqlLogger(logQueries, logger);

const start = (req: expressLogger.Request) => {
  trace.start(req.headers[TRACE_CONTEXT_NAME] as string);
};

export const requestLogger = expressLogger.requestLogger(logger, start);
export const traceMiddleware = trace.traceMiddleware(TRACE_CONTEXT_NAME);

export default logger;