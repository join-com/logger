import gcloudLogger, { Logger } from '@join-com/gcloud-logger';
import { Level } from '@join-com/gcloud-logger';

export class SqlLogger {
  private readonly logQueries: boolean;
  constructor(
    logQueries: boolean = false,
    private readonly logger: Logger = gcloudLogger,
  ) {
    this.logQueries = logQueries;
  }
  public logQuery(query: string, parameters?: any[], _?: any) {
    if (!this.logQueries) {
      return;
    }
    const level = query === 'SELECT 1 as result' ? Level.DEBUG : Level.INFO;
    this.logger.log(level, `executing query: ${query}`, { parameters });
  }

  public logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    _?: any,
  ) {
    this.logger.error(`query failed: ${query}`, { error, parameters });
  }

  public logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    _?: any,
  ) {
    this.logger.warn(`query is slow: ${query}`, { time, parameters });
  }

  public logSchemaBuild(message: string, _?: any) {
    this.logger.info(message);
  }

  public logMigration(message: string, _?: any) {
    this.logger.info(message);
  }

  public log(level: 'log' | 'info' | 'warn', message: any, _?: any) {
    switch (level) {
      case 'log':
        this.logger.debug(message);
        break;
      case 'info':
        this.logger.info(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
    }
  }
}

export default SqlLogger;
