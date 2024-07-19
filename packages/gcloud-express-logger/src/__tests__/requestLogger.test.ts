import request from 'supertest'
import { IGcloudLogger } from '..'
import { createApp } from './support/app'

const loggerMock = jest.mocked<IGcloudLogger>({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
})

describe('requestLogger', () => {
  const app = createApp(loggerMock)

  describe('with rest API', () => {
    it('logs request', async () => {
      const body = { title: 'Backend Engineer' }

      await request(app)
        .post('/api/jobs')
        .set('release', 'recruiter-app@v13.613.0')
        .set('transaction-id', 'z8zpql5')
        .set('transaction-name', 'PublishJob')
        .set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ...')
        .set('referer', 'https://join.com/dashboard')
        .send(body)
        .expect(201)

      expect(loggerMock.info).toHaveBeenCalledWith('/api/jobs', {
        httpRequest: expect.objectContaining({
          requestMethod: 'POST',
          requestUrl: '/api/jobs',
          status: 201,
          release: 'recruiter-app@v13.613.0',
          transactionId: 'z8zpql5',
          transactionName: 'PublishJob',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ...',
          referer: 'https://join.com/dashboard',
          latency: expect.stringMatching(/\d+\.\d+ms/),
          remoteIp: expect.any(String),
        }),
        requestTime: expect.any(Number),
        reqBody: body,
        query: {},
      })
    })
  })

  describe('with graphql API', () => {
    const query = `
        query ListCompanies {
          companies {
            id
          }
        }
      `

    it('logs request', async () => {
      await request(app).post('/graphql').send({ query }).expect(200)
      expect(loggerMock.info).toHaveBeenCalledWith('/graphql', {
        httpRequest: expect.objectContaining({
          requestMethod: 'POST',
          requestUrl: '/graphql',
          status: 200,
        }),
        requestTime: expect.any(Number),
        reqBody: { query },
        query: {},
      })
    })

    it('logs operation name if provided', async () => {
      const operationName = 'ListCompanies'

      await request(app).post('/graphql').send({ query, operationName }).expect(200)

      expect(loggerMock.info).toHaveBeenCalledWith(`/graphql ${operationName}`, expect.any(Object))
    })
  })
})
