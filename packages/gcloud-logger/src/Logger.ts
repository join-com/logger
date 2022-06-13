import * as os from 'os'
import * as util from 'util'
import chalk from 'chalk'
import { serializeError } from 'serialize-error'

enum LevelNumber {
  DEFAULT = 0,
  DEBUG = 100,
  INFO = 200,
  NOTICE = 300,
  WARNING = 400,
  ERROR = 500,
  CRITICAL = 600,
  ALERT = 700,
  EMERGENCY = 800,
}

export enum Level {
  DEFAULT = 'DEFAULT',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  NOTICE = 'NOTICE',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
  ALERT = 'ALERT',
  EMERGENCY = 'EMERGENCY',
}

enum Colors {
  DEFAULT,
  DEBUG = '#1e90ff', // dodgerblue
  INFO = '#008000', // green
  NOTICE = '#ff8c00', // darkorange
  WARNING = '#ffff00', // yellow
  ERROR = '#dc143c', // crimson
  CRITICAL = '#ff0000', // red
  ALERT = '#b22222', // firebrick
  EMERGENCY = '#8b0000', // darkred
}

const errorOutputStartsFrom = LevelNumber.ERROR

const logLevel = (level: string | undefined) => {
  switch (level) {
    case 'DEFAULT':
      return LevelNumber.DEFAULT
    case 'DEBUG':
      return LevelNumber.DEBUG
    case 'INFO':
      return LevelNumber.INFO
    case 'NOTICE':
      return LevelNumber.NOTICE
    case 'WARNING':
      return LevelNumber.WARNING
    case 'ERROR':
      return LevelNumber.ERROR
    case 'CRITICAL':
      return LevelNumber.CRITICAL
    case 'ALERT':
      return LevelNumber.ALERT
    case 'EMERGENCY':
      return LevelNumber.EMERGENCY
    default:
      return LevelNumber.INFO
  }
}

export class Logger {
  private readonly logLevelNumber: LevelNumber

  constructor(
    private readonly useJsonFormat: boolean,
    logLevelStarts?: string,
    private readonly excludeKeys = ['password', 'token', 'newPassword', 'oldPassword'],
  ) {
    this.logLevelNumber = logLevel(logLevelStarts)
  }

  public debug(message: string, payload?: unknown) {
    this.log(Level.DEBUG, message, payload)
  }

  public info(message: string, payload?: unknown) {
    this.log(Level.INFO, message, payload)
  }

  public notice(message: string, payload?: unknown) {
    this.log(Level.NOTICE, message, payload)
  }

  public warn(message: string, payload?: unknown) {
    this.log(Level.WARNING, message, payload)
  }

  public error(message: string, payload?: unknown) {
    this.log(Level.ERROR, message, payload)
  }

  public crit(message: string, payload?: unknown) {
    this.log(Level.CRITICAL, message, payload)
  }

  public alert(message: string, payload?: unknown) {
    this.log(Level.ALERT, message, payload)
  }

  public emerg(message: string, payload?: unknown) {
    this.log(Level.EMERGENCY, message, payload)
  }

  public log(level: Level | Level.DEFAULT, messageText: string, payload?: unknown) {
    if (LevelNumber[level] < this.logLevelNumber) {
      return
    }

    this.print(level, this.formatMessage(level, messageText, payload))
  }

  public reportError(err: unknown) {
    const fullError = util.inspect(err, { showHidden: false, depth: null })

    this.error(this.getMessage(err), { fullError })
  }

  private getMessage(err: unknown) {
    if (Logger.isError(err)) {
      return err.stack || err.message
    }

    return this.stringify(err)
  }

  private formatMessage(level: Level, messageText: string, payload?: unknown): string {
    return this.useJsonFormat
      ? this.formatJsonMessage(level, messageText, payload)
      : this.formatPlainTextMessage(level, messageText, payload)
  }

  private formatJsonMessage(level: Level, messageText: string, payload?: unknown): string {
    const payloadObject = payload ? { payload } : undefined

    const message = {
      ...payloadObject,
      message: messageText,
      severity: level,
      level: LevelNumber[level],
    }
    return `${this.stringify(message)}${os.EOL}`
  }

  private formatPlainTextMessage(level: Level, messageText: string, payload?: unknown): string {
    const msgFn = chalk.bold.hex(Colors[level].toString())
    const stringMsg = payload ? this.stringify(payload) : ''
    const msg = `${msgFn(level.toLowerCase())}: ${messageText} ${stringMsg}`
    return `${msg}${os.EOL}`
  }

  private print(level: Level, msg: string) {
    if (LevelNumber[level] >= errorOutputStartsFrom) {
      process.stderr.write(msg)
    } else {
      process.stdout.write(msg)
    }
  }

  private stringify(message: unknown) {
    const excludeSensitive = (key: string, value: any) => {
      // exclude sensitive values
      if (this.excludeKeys.indexOf(key) !== -1) {
        return '[FILTERED]'
      }
      // simply return otherwise
      return value
    }

    return JSON.stringify(serializeError(message), excludeSensitive)
  }

  private static isError(err: unknown): err is Error {
    if (!err) {
      return false
    }
    return typeof err === 'object' && 'message' in err
  }
}
