import bodyParser from 'body-parser'
import express, { Application, Request, Router, Response } from 'express'
import { IGcloudLogger, requestLogger } from '../../'

const jobsRouter = Router()
jobsRouter.post('/jobs', (_req, res) => {
  res.status(201).send('OK')
})

const companiesRouter = Router()
jobsRouter.post('/companies', (_req, res) => {
  res.status(201).send('OK')
})

const graphqlHandler = (_req: Request, res: Response) => {
  res.status(200).send('OK')
}

const logExtraFields = (req: Request) => {
  return req.headers['partner-id'] ? { partner: req.headers['partner-id'] } : {}
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
