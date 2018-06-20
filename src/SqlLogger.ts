import logger from './';
import { Level } from '../packages/gj-logger/src/Logger';

export class SqlLogger {
  private readonly logQueries: boolean;
  constructor(logQueries: boolean = false) {
    this.logQueries = logQueries;
  }
  public logQuery(query: string, parameters?: any[], _?: any) {
    if (!this.logQueries) {
      return;
    }
    const level = query === 'SELECT 1 as result' ? Level.DEBUG : Level.INFO;
    logger.log(level, `executing query: ${query}`, { parameters });
  }

  public logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    _?: any,
  ) {
    logger.error(`query failed: ${query}`, { error, parameters });
  }

  public logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    _?: any,
  ) {
    logger.warn(`query is slow: ${query}`, { time, parameters });
  }

  public logSchemaBuild(message: string, _?: any) {
    logger.info(message);
  }

  public logMigration(message: string, _?: any) {
    logger.info(message);
  }

  public log(level: 'log' | 'info' | 'warn', message: any, _?: any) {
    switch (level) {
      case 'log':
        logger.debug(message);
        break;
      case 'info':
        logger.info(message);
        break;
      case 'warn':
        logger.warn(message);
        break;
    }
  }
}
