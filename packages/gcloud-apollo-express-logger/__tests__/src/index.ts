import { formatError, errorLoggingExtension } from '../../src/index';
import { ApolloServer } from 'apollo-server-express';
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

describe('formatError', () => {
  it('formats error object', () => {
    const graphqlError = new GraphQLError('message');
    const formattedError = formatError(graphqlError);
    expect(formattedError).toMatchSnapshot();
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
