import { Logger } from '../src'
describe('logger', () => {
  it('truncates field over maxFieldLength', () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write');

    const logger: Logger = new Logger(true, 'DEBUG', ['password', 'token', 'newPassword', 'oldPassword'], 5)
    logger.debug('hm', { response: { some: 'longWord' } })
    const log = '{"response":{"some":"longW...TRUNCATED"},"message":"hm","severity":"DEBUG","level":100}\n'
    expect(stdoutSpy).toHaveBeenCalledWith(log);
  })

  it('hides field in excludeKeys', () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write');

    const logger: Logger = new Logger(true, 'DEBUG', ['password', 'token', 'newPassword', 'oldPassword', 'some'], 5)
    logger.debug('hm', { response: { some: 'longWord' } })
    const log = '{"response":{"some":"[FILTERED]"},"message":"hm","severity":"DEBUG","level":100}\n'
    expect(stdoutSpy).toHaveBeenCalledWith(log);
  })
})
