/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export interface IGcloudLogger {
  debug: (message: string, payload?: unknown) => void
  info: (message: string, payload?: unknown) => void
  warn: (message: string, payload?: unknown) => void
  error: (message: string, payload?: unknown) => void
}

export class SqlLogger {
  constructor(private readonly logQueries: boolean, private readonly logger: IGcloudLogger) {
    this.logQueries = logQueries
  }

  public logQuery(query: string, parameters?: any[], _?: never): void {
    if (!this.logQueries) {
      return
    }

    if (query !== 'SELECT 1 as result') {
      this.logger.info(`executing query: ${query}`, { parameters })
    } else {
      this.logger.debug(`executing query: ${query}`)
    }
  }

  public logQueryError(error: string, query: string, parameters?: any[], _?: never): void {
    this.logger.error(`query failed: ${query}`, { error, parameters })
  }

  public logQuerySlow(queryTime: number, query: string, parameters?: any[], _?: never): void {
    this.logger.warn(`query is slow: ${query}`, { queryTime, parameters })
  }

  public logSchemaBuild(message: string, _?: never): void {
    this.logger.info(message)
  }

  public logMigration(message: string, _?: never): void {
    this.logger.info(message)
  }

  public log(level: 'log' | 'info' | 'warn', message: any, _?: never): void {
    switch (level) {
      case 'log':
        this.logger.debug(message)
        break
      case 'info':
        this.logger.info(message)
        break
      case 'warn':
        this.logger.warn(message)
        break
    }
  }
}
