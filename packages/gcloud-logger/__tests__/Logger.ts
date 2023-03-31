import { Logger } from '../src'
describe('logger', () => {
  it('truncates field over maxFieldLength', () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write');

    const logger = new Logger(true, 'DEBUG', [], 5)
    logger.debug('msg', { response: { some: 'longWord' } })
    const log = '{"response":{"some":"longW...TRUNCATED"},"message":"msg","severity":"DEBUG","level":100}\n'
    expect(stdoutSpy).toHaveBeenCalledWith(log);
  })

  it('hides field in excludeKeys', () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write');

    const logger = new Logger(true, 'DEBUG', ['some'], 5)
    logger.debug('msg', { response: { some: 'longWord' } })
    const log = '{"response":{"some":"[FILTERED]"},"message":"msg","severity":"DEBUG","level":100}\n'
    expect(stdoutSpy).toHaveBeenCalledWith(log);
  })
})
