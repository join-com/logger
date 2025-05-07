import bodyParser from 'body-parser'
import express, { Application, Request, Router, Response } from 'express'
import { IGcloudLogger, requestLogger } from '../../'

const jobsRouter = Router()
jobsRouter.post('/jobs', (_req, res) => {
  res.setHeader('x-response-header', 'actual-response-header')
  res.status(201).send('OK')
})

const companiesRouter = Router()
jobsRouter.post('/companies', (_req, res) => {
  res.setHeader('x-response-header', 'actual-response-header')
  res.status(201).send('OK')
})

const graphqlHandler = (_req: Request, res: Response) => {
  res.setHeader('x-response-header', 'actual-response-header')
  res.status(200).send('OK')
}

const logExtraFields = (req: Request, res: Response) => {
  const extraFields: Record<string, string | string[] | undefined | number> = {}

  if (req.headers['partner-id']) {
    extraFields['partner'] = req.headers['partner-id']
  }

  if (res.getHeaders()['x-response-header']) {
    extraFields['response-header'] = res.getHeaders()['x-response-header']
  }

  return extraFields
}

export const createApp = (logger: IGcloudLogger): Application => {
  const app = express()

  app.use(requestLogger(logger, logExtraFields))
  app.use(bodyParser.json())

  const restRouter = express.Router()
  restRouter.use([jobsRouter, companiesRouter])

  app.use('/api', restRouter)
  app.use('/graphql', graphqlHandler)

  return app
}
