import { GraphQLError } from 'graphql/error/GraphQLError';
import { ClassValidationError } from '@join-private/base-errors';
import { pick, omit } from '../support/utils';

interface IFormatterOptions {
  whiteList?: string[];
  blackList?: string[];
}

interface IException {
  code?: number;
}

export const errorFormatter = (options?: IFormatterOptions) => (
  error: GraphQLError,
) => {
  if (error.extensions) {
    let exception = error.extensions.exception;
    if (exception && exception.validationErrors) {
      exception = new ClassValidationError(exception.validationErrors);
    } else if (isAuthenticationError(error)) {
      exception = {
        code: 'unauthorized',
        message: 'Authentication error',
      };
    } else if (isForbiddenError(error)) {
      exception = {
        code: 'forbidden',
        message: 'Forbidden error',
      };
    } else if (isUnknownError(exception)) {
      exception = {
        code: 'unknown',
        message: 'Server error',
      };
    }
    if (options) {
      const { whiteList, blackList } = options;
      exception = whiteList ? pick(exception, whiteList) : exception;
      exception = blackList ? omit(exception, blackList) : exception;
    }
    error.extensions.exception = exception;
  }

  return error;
};

const isUnknownError = (exception: IException | undefined) =>
  Boolean(!exception || (exception && !exception.code));

const isAuthenticationError = (error: GraphQLError) =>
  Boolean(error.extensions && error.extensions.code === 'UNAUTHENTICATED');

const isForbiddenError = (error: GraphQLError) =>
  Boolean(error.extensions && error.extensions.code === 'FORBIDDEN');
