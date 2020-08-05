import logger, { Level } from '@join-com/gcloud-logger-trace';
import * as trace from '@join-com/node-trace';
import { GraphQLExtension } from 'apollo-server-core';
import { GraphQLError } from 'graphql';
import { ForbiddenError, Maybe } from 'type-graphql';

export default errorLoggingExtension;

const isAboveWarningLevel = (originalError: Maybe<Error>): boolean =>
  !(originalError instanceof ForbiddenError);

const determineLogLevel = (errors: readonly GraphQLError[]): Level => {
  const errorsAboveWarningLevel = errors
    .map(e => e.originalError)
    .filter(isAboveWarningLevel);
  return errorsAboveWarningLevel.length ? Level.ERROR : Level.WARNING;
};

export const errorLoggingExtension: GraphQLExtension = {
  requestDidStart: ({ request }) => {
    if (
      !request ||
      !request.headers ||
      !request.headers.get(trace.getTraceContextName())
    ) {
      logger.warn("No trace id present - can't enable request tracing");
      return;
    }
    trace.start(request.headers.get(trace.getTraceContextName())!);
  },
  didEncounterErrors: errors => {
    const errorMessages = errors.map(e => e.message).join(', ');
    logger.log(
      determineLogLevel(errors),
      `Encountered errors when processing GraphQL request: [${errorMessages}]`,
      errors,
    );
  },
};
