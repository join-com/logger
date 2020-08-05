import { errorLoggingExtension, errorFormatter } from '../../src/index';
import {
  ApolloServer,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-express';
import express from 'express';
import request from 'supertest';
import { GraphQLError } from 'graphql';
import { buildSchema } from 'type-graphql';
import { TestResolver } from '../../support/TestResolver';
import { DEFAULT_TRACE_CONTEXT_NAME, start } from '@join-com/node-trace';

jest.mock('@join-com/node-trace', () => ({
  ...jest.requireActual('@join-com/node-trace'),
  start: jest.fn(),
}));

describe('errorFormatter', () => {
  it('formats error object', () => {
    const graphqlError = new GraphQLError('message');
    const formattedError = errorFormatter()(graphqlError);
    expect(formattedError.message).toEqual('message');
  });

  it('formats error object with unkown error', () => {
    const _ = undefined;
    const graphqlError = new GraphQLError('', _, _, _, _, _, {});
    const formattedError = errorFormatter()(graphqlError);
    expect(formattedError.extensions).toEqual({
      exception: { code: 500, message: 'Server error' },
    });
  });

  it('formats ForbiddenError', () => {
    const forbiddenError = new ForbiddenError('Forbidden');
    const formattedError = errorFormatter()(forbiddenError);
    expect(formattedError.extensions).toEqual({
      code: 'FORBIDDEN',
      exception: {
        code: 403,
        message: 'Forbidden error',
      },
    });
  });

  it('formats AuthenticationError', () => {
    const unauthorizedError = new AuthenticationError('Unauthenticated');
    const formattedError = errorFormatter()(unauthorizedError);
    expect(formattedError.extensions).toEqual({
      code: 'UNAUTHENTICATED',
      exception: {
        code: 401,
        message: 'Authentication error',
      },
    });
  });

  const extensions = {
    exception: {
      code: 400,
      secret: 'secret1',
    },
  };
  const _ = undefined;
  it('whilelist > picks specified error fields', () => {
    const graphqlError = new GraphQLError('', _, _, _, _, _, extensions);
    const formattedError = errorFormatter({ whiteList: ['code'] })(
      graphqlError,
    );
    expect(formattedError.extensions).toEqual({ exception: { code: 400 } });
  });

  it('blackList > omits specified error fields', () => {
    const graphqlError = new GraphQLError('', _, _, _, _, _, extensions);
    const formattedError = errorFormatter({ blackList: ['secret'] })(
      graphqlError,
    );
    expect(formattedError.extensions).toEqual({ exception: { code: 400 } });
  });
});

describe('errorLoggingExtension', () => {
  let server, app: express.Express;
  beforeAll(async () => {
    const schema = await buildSchema({
      resolvers: [TestResolver],
    });
    server = new ApolloServer({
      schema,
      extensions: [() => errorLoggingExtension],
    });
    app = await express();
    server.applyMiddleware({ app, cors: true, path: '/test' });
  });
  it('Should report errors', async () => {
    const query = `
        query Test {
          testValidationError {
              id
          }
        }
      `;
    await request(app)
      .post('/test')
      .set(DEFAULT_TRACE_CONTEXT_NAME, 'someTraceId')
      .send({ query })
      .expect(400);

    expect(start).toHaveBeenCalledWith('someTraceId');
  });
});
