import bodyParser from 'body-parser'
import express, { Application } from 'express'
import { IGcloudLogger, requestLogger } from '../../'

const jobsRouter = express.Router()
jobsRouter.post('/jobs', (_req, res) => {
  res.status(201).send('OK')
})

const companiesRouter = express.Router()
jobsRouter.post('/companies', (_req, res) => {
  res.status(201).send('OK')
})

const graphqlHandler = (_req: express.Request, res: express.Response) => {
  res.status(200).send('OK')
}

export const createApp = (logger: IGcloudLogger): Application => {
  const app = express()

  app.use(requestLogger(logger))
  app.use(bodyParser.json())

  const restRouter = express.Router()
  restRouter.use([jobsRouter, companiesRouter])

  app.use('/api', restRouter)
  app.use('/graphql', graphqlHandler)

  return app
}
