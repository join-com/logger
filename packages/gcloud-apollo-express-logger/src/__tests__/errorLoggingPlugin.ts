import { logger } from '@join-com/gcloud-logger-trace'
import { ApolloServer } from 'apollo-server-express'
import express, { Application } from 'express'
import { GraphQLError } from 'graphql'
import { mocked } from 'jest-mock'
import request from 'supertest'
import { buildSchema } from 'type-graphql'
import { errorLoggingPlugin } from '../index'
import { TestResolver } from './support/resolvers/TestResolver'

jest.mock('@join-com/gcloud-logger-trace')

const loggerMock = mocked(logger)

describe('errorLoggingPlugin', () => {
  let server: ApolloServer
  let app: Application

  beforeAll(async () => {
    const schema = await buildSchema({ resolvers: [TestResolver] })
    server = new ApolloServer({ schema, plugins: [errorLoggingPlugin] })
    await server.start()

    app = express()
    server.applyMiddleware({ app, cors: true, path: '/graphql' })
  })

  it('logs error as warning', async () => {
    const query = `
      query Test {
        invalidQuery {
          id
        }
      }
    `
    const response = await request(app).post('/graphql').send({ query })

    expect(response.status).toBe(400)
    expect(loggerMock.warn).toHaveBeenCalledWith(
      'Encountered errors when processing GraphQL request: [Cannot query field "invalidQuery" on type "Query".]',
      [expect.any(GraphQLError)],
    )
  })
})
