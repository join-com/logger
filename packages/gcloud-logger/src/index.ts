import { Logger } from './Logger'

export { Logger, Level } from './Logger'

export const logger = new Logger(process.env['NODE_ENV'] === 'production', process.env['LOG_LEVEL'])

export const reportError = (e: unknown) => {
  logger.reportError(e)
}