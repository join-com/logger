import { Logger } from './Logger'

const USE_JSON_FORMAT = process.env['NODE_ENV'] === 'production'
const logger = new Logger(USE_JSON_FORMAT, process.env['LOG_LEVEL'])

export { Logger, Level } from './Logger'
export default logger
