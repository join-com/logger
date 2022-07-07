import * as os from 'os'
import serializeError from '@stdlib/error-to-json'
import chalk from 'chalk'

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
    this.error(this.getMessage(err), err)
  }

  private getMessage(err: unknown) {
    return this.isError(err) ? err.message : 'Invalid error reported'
  }

  private formatMessage(level: Level, messageText: string, payload?: unknown): string {
    const payloadObject = this.getPayloadObject(payload)
    return this.useJsonFormat
      ? this.formatJsonMessage(level, messageText, payloadObject)
      : this.formatPlainTextMessage(level, messageText, payloadObject)
  }

  private formatJsonMessage(level: Level, messageText: string, payload?: Record<string, unknown>): string {
    const message = {
      ...payload,
      message: messageText,
      severity: level,
      level: LevelNumber[level],
    }
    return `${this.stringify(message)}${os.EOL}`
  }

  private formatPlainTextMessage(level: Level, messageText: string, payload?: Record<string, unknown>): string {
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
    // https://gist.github.com/saitonakamura/d51aa672c929e35cc81fa5a0e31f12a9
    const replaceCircular = (obj: any, alreadySeen = new WeakSet()): any => {
      if (typeof obj !== 'object') {
        return obj
      }

      if (!obj) {
        return obj
      }

      if (alreadySeen.has(obj)) {
        return '[CIRCULAR]'
      }

      alreadySeen.add(obj)

      if (Array.isArray(obj)) {
        return obj.map(item => replaceCircular(item, alreadySeen))
      }

      const serializedObj = obj instanceof Error ? serializeError(obj) : obj
      const keys = Object.keys(serializedObj)
      if (keys.length === 0) {
        return obj
      }

      const newObj: Record<string, unknown> = {}
      keys.forEach(key => {
        const val = replaceCircular(obj[key], alreadySeen)
        newObj[key] = val
      })

      alreadySeen.delete(obj)
      return newObj
    }

    const excludeSensitive = (key: string, value: any) => {
      // exclude sensitive values
      if (this.excludeKeys.indexOf(key) !== -1) {
        return '[FILTERED]'
      }
      // simply return otherwise
      return value
    }

    return JSON.stringify(replaceCircular(message), excludeSensitive)
  }

  private isError(err: unknown): err is Error {
    if (!err) {
      return false
    }
    return typeof err === 'object' && 'message' in err && 'stack' in err
  }

  private getPayloadObject(payload?: unknown): Record<string, unknown> | undefined {
    if (!payload) {
      return undefined
    }

    if (this.isError(payload)) {
      return { error: payload }
    }

    if (this.isObject(payload)) {
      return payload
    }

    return { payload }
  }

  private isObject = (obj: unknown): obj is Record<string, unknown> => {
    return obj instanceof Object && obj.constructor === Object
  }
}
