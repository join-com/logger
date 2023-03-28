import Pino from 'pino'

export enum Level {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
const PinoLevelToCloudSeverityLookup = new Map<string,string>(Object.entries({
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
}));

// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
const PinoLevelToCloudLevelLookup = new Map<string,number>(Object.entries({
  debug: 100,
  info: 200,
  warn: 400,
  error: 500,
  fatal: 600,
}));

const OldLogLevelToPinoLevel = new Map<string,string>(Object.entries({
  DEFAULT: 'info',
  DEBUG: 'debug',
  INFO: 'info',
  NOTICE: 'info',
  WARNING: 'warn',
  ERROR: 'error',
  CRITICAL: 'fatal',
  ALERT: 'fatal',
  EMERGENCY: 'fatal'
}));

export class Logger {
  private readonly logger: Pino.Logger

  constructor(
    disablePrettyPrint: boolean,
    logLevelStarts?: string,
    excludeKeys = ['password', 'token', 'newPassword', 'oldPassword']
  ) {
    let logLevel = logLevelStarts || 'info'
    if (!PinoLevelToCloudLevelLookup.has(logLevel)) {
      logLevel = OldLogLevelToPinoLevel.get(logLevel) || 'info'
    }
    const pinoConfig: {[key: string]: any} = {
      base: undefined, // removes pid and hostname fields from json logs
      timestamp: false, // removes timestamp, as it's provided by google cloud
      level: logLevel,
      redact: excludeKeys,
      messageKey: 'message',
      formatters: {
        messageKey: 'message',
        level: (label: string, _number: number) => {
          return {
            severity: PinoLevelToCloudSeverityLookup.get(label) || PinoLevelToCloudSeverityLookup.get(label),
            level: PinoLevelToCloudLevelLookup.get(label),
          }
        },
      },
    }
    if (!disablePrettyPrint) {
      pinoConfig['transport'] = { target: 'pino-pretty' }
    }
    this.logger = Pino(pinoConfig)
  }

  public debug(message: string, payload?: unknown) {
    this.logger.debug(payload, message)
  }

  public info(message: string, payload?: unknown) {
    this.logger.info(payload, message)
  }

  public warn(message: string, payload?: unknown) {
    this.logger.warn(payload, message)
  }

  public error(message: string, payload?: unknown) {
    this.logger.error(payload, message)
  }

  public fatal(message: string, payload?: unknown) {
    this.logger.fatal(payload, message)
  }

  public reportError(err: unknown) {
    this.error(this.getMessage(err), err)
  }

  private getMessage(err: unknown) {
    return this.isError(err) ? err.message : 'Invalid error reported'
  }


  private isError(err: unknown): err is Error {
    if (!err) {
      return false
    }
    return typeof err === 'object' && 'message' in err && 'stack' in err
  }
}
