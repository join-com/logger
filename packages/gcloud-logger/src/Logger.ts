import chalk from 'chalk';
import * as os from 'os';
import * as util from 'util';

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
  DEBUG = 'red',
  INFO = 'green',
  NOTICE = 'darkorange',
  WARNING = 'yellow',
  ERROR = 'crimson',
  CRITICAL = 'red',
  ALERT = 'firebrick',
  EMERGENCY = 'darkred',
}

const errorOutputStartsFrom = LevelNumber.ERROR;

const logLevel = (level: string | undefined) => {
  switch (level) {
    case 'DEFAULT':
      return LevelNumber.DEFAULT;
    case 'DEBUG':
      return LevelNumber.DEBUG;
    case 'INFO':
      return LevelNumber.INFO;
    case 'NOTICE':
      return LevelNumber.NOTICE;
    case 'WARNING':
      return LevelNumber.WARNING;
    case 'ERROR':
      return LevelNumber.ERROR;
    case 'CRITICAL':
      return LevelNumber.CRITICAL;
    case 'ALERT':
      return LevelNumber.ALERT;
    case 'EMERGENCY':
      return LevelNumber.EMERGENCY;
    default:
      return LevelNumber.INFO;
  }
};

export class Logger {
  private readonly logLevelNumber: LevelNumber;

  constructor(
    private readonly useJsonFormat: boolean,
    logLevelStarts?: string,
    private readonly excludeKeys = ['password', 'token'],
    private readonly getTraceContext?: () => string,
  ) {
    this.logLevelNumber = logLevel(logLevelStarts);
  }

  public debug(message: string, payload?: any) {
    this.log(Level.DEBUG, message, payload);
  }

  public info(message: string, payload?: any) {
    this.log(Level.INFO, message, payload);
  }

  public notice(message: string, payload?: any) {
    this.log(Level.NOTICE, message, payload);
  }

  public warn(message: string, payload?: any) {
    this.log(Level.WARNING, message, payload);
  }

  public error(message: string, payload?: any) {
    this.log(Level.ERROR, message, payload);
  }

  public crit(message: string, payload?: any) {
    this.log(Level.CRITICAL, message, payload);
  }

  public alert(message: string, payload?: any) {
    this.log(Level.ALERT, message, payload);
  }

  public emerg(message: string, payload?: any) {
    this.log(Level.EMERGENCY, message, payload);
  }

  public log(level: Level | Level.DEFAULT, messageText: string, payload?: any) {
    if (LevelNumber[level] < this.logLevelNumber) {
      return;
    }

    this.print(level, this.formatMessage(level, messageText, payload));
  }

  public reportError(err: Error) {
    const fullError = util.inspect(err, { showHidden: false, depth: null });
    this.error(err.stack!, { fullError });
  }

  private stringify(message: any) {
    const excludeFn = (key: string, value: string) => {
      if (this.excludeKeys.indexOf(key) !== -1) {
        return '[FILTERED]';
      }
      return value;
    };
    return JSON.stringify(message, excludeFn);
  }

  private formatMessage(
    level: Level,
    messageText: string,
    payload?: any,
  ): string {
    const trace = this.getTraceContext && this.getTraceContext();
    const payloadWitTrace = trace ? { ...payload, trace } : payload;
    if (this.useJsonFormat) {
      const message = {
        message: messageText,
        ...payloadWitTrace,
        severity: level,
        level: LevelNumber[level],
      };
      return `${this.stringify(message)}${os.EOL}`;
    }
    const msgFn = chalk.bold.keyword(Colors[level].toString());
    const stringMsg =
      (payloadWitTrace && this.stringify(payloadWitTrace)) || '';
    const msg = `${msgFn(level.toLowerCase())}: ${messageText} ${stringMsg}`;
    return `${msg}${os.EOL}`;
  }

  private print(level: Level, msg: string) {
    if (LevelNumber[level] >= errorOutputStartsFrom) {
      process.stderr.write(msg);
    } else {
      process.stdout.write(msg);
    }
  }
}
