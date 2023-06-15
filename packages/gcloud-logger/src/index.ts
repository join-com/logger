import { Logger } from './Logger'

export { Logger, Level } from './Logger'

export const logger = new Logger(
  process.env['NODE_ENV'] === 'production',
  process.env['LOG_LEVEL'],
  undefined,
  parseInt(process.env['LOG_MAX_FIELD_LENGTH'] ?? '', 10),
)

export const reportError = (e: unknown) => {
  logger.reportError(e)
}
