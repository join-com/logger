import Pino from 'pino'

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

export class Logger {
  private readonly logger: Pino.Logger

  constructor(
    logLevelStarts?: string,
    // private readonly excludeKeys = ['password', 'token', 'newPassword', 'oldPassword'],
  ) {
    this.logger = Pino({
      level: logLevelStarts,
      transport: {
        target: 'pino-pretty'
      },
      customLevels: {
        debug: 100,
        info: 200,
        notice: 300,
        warning: 400,
        error: 500,
        critical: 600,
        alert: 700,
        emergency: 800
      }
    })
  }

  public debug(message: string, payload?: unknown) {
    this.logger.debug(payload, message)
  }

  public info(message: string, payload?: unknown) {
    this.logger.info(payload, message)
  }

  public notice(message: string, payload?: unknown) {
    this.logger.debug(payload, message)
  }

  public warn(message: string, payload?: unknown) {
    this.logger.warn(payload, message)
  }

  public error(message: string, payload?: unknown) {
    this.logger.error(payload, message)
  }

  public crit(message: string, payload?: unknown) {
    this.logger.fatal(payload, message)
  }

  public alert(message: string, payload?: unknown) {
    this.logger.fatal(payload, message)
  }

  
  public emerg(message: string, payload?: unknown) {
    this.logger.fatal(payload, message)
  }

  public reportError(err: unknown) {
    this.error(this.getMessage(err), err)
  }

  private getMessage(err: unknown) {
    return this.isError(err) ? err.message : 'Invalid error reported'
  }



  // private stringify(message: unknown) {
  //   // https://gist.github.com/saitonakamura/d51aa672c929e35cc81fa5a0e31f12a9
  //   const replaceCircular = (obj: any, alreadySeen = new WeakSet()): any => {
  //     if (typeof obj !== 'object') {
  //       return obj
  //     }
  //
  //     if (!obj) {
  //       return obj
  //     }
  //
  //     if (alreadySeen.has(obj)) {
  //       return '[CIRCULAR]'
  //     }
  //
  //     alreadySeen.add(obj)
  //
  //     if (typeof obj.pipe === 'function') {
  //       return '[object Stream]'
  //     }
  //
  //     if (Buffer.isBuffer(obj)) {
  //       return '[object Buffer]'
  //     }
  //
  //     if (Array.isArray(obj)) {
  //       return obj.map(item => replaceCircular(item, alreadySeen))
  //     }
  //
  //     const serializedObj = obj instanceof Error ? this.serializeError(obj) : obj
  //     const keys = Object.keys(serializedObj)
  //     if (keys.length === 0) {
  //       return obj
  //     }
  //
  //     const newObj: Record<string, unknown> = {}
  //     keys.forEach(key => {
  //       const val = replaceCircular(obj[key], alreadySeen)
  //       newObj[key] = val
  //     })
  //
  //     alreadySeen.delete(obj)
  //     return newObj
  //   }
  //
  //   const excludeSensitive = (key: string, value: any) => {
  //     // exclude sensitive values
  //     if (this.excludeKeys.indexOf(key) !== -1) {
  //       return '[FILTERED]'
  //     }
  //     // simply return otherwise
  //     return value
  //   }
  //
  //   return JSON.stringify(replaceCircular(message), excludeSensitive)
  // }

  private isError(err: unknown): err is Error {
    if (!err) {
      return false
    }
    return typeof err === 'object' && 'message' in err && 'stack' in err
  }

  // private getPayloadObject(payload?: unknown): Record<string, unknown> | undefined {
  //   if (!payload) {
  //     return undefined
  //   }
  //
  //   if (this.isError(payload)) {
  //     return { error: payload }
  //   }
  //
  //   if (this.isObject(payload)) {
  //     return payload
  //   }
  //
  //   return { payload }
  // }
  //
  // private serializeError<E extends Error>(error: E): Record<string, unknown> {
  //   const serializedError: Record<string, unknown> = {
  //     name: error.name,
  //     message: error.message,
  //   }
  //
  //   if (error.stack) {
  //     serializedError['stack'] = error.stack
  //   }
  //
  //   // Possible Node.js (system error) properties...
  //   if (this.hasProperty('code', error)) {
  //     serializedError['code'] = error.code
  //   }
  //
  //   if (this.hasProperty('errno', error)) {
  //     serializedError['errno'] = error.errno
  //   }
  //
  //   if (this.hasProperty('syscall', error)) {
  //     serializedError['syscall'] = error.syscall
  //   }
  //
  //   // Any enumerable properties...
  //   for (const key in error) {
  //     serializedError[key] = error[key]
  //   }
  //
  //   return serializedError
  // }

  // private hasProperty<T extends string>(property: T, obj: unknown): obj is { [property in T]: unknown } {
  //   return Boolean(obj && typeof obj === 'object' && property in obj)
  // }
  //
  // private isObject(obj: unknown): obj is Record<string, unknown> {
  //   return obj instanceof Object && obj.constructor === Object
  // }
}
