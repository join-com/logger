import { Logger } from './Logger'

export { Logger, Level } from './Logger'

const DEFAULT_MAX_LENGTH = '1000'

export const logger = new Logger(
  process.env['NODE_ENV'] === 'production',
  process.env['LOG_LEVEL'],
  undefined,
  parseInt(process.env['LOG_MAX_FIELD_LENGTH'] ?? DEFAULT_MAX_LENGTH, 10),
)

export const reportError = (e: unknown): void => {
  logger.reportError(e)
}
