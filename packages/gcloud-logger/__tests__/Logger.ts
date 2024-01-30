import { Logger } from '../src'
describe('logger', () => {
  afterEach(() => jest.resetAllMocks())

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

  it('ignores provided max field length if warning', () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write')

    const logger = new Logger(true, 'DEBUG', [], 5)
    logger.warn('msg', { response: { some: 'longWord' } })
    const log = '{"response":{"some":"longWord"},"message":"msg","severity":"WARNING","level":400}\n'
    expect(stdoutSpy).toHaveBeenCalledWith(log)
  })

  it('truncates field over maxFieldLengthForError if warning', () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write')

    const logger = new Logger(true, 'DEBUG', [], 5)
    logger.warn('msg', { response: { some: 'x'.repeat(8000) } })
    expect(stdoutSpy.mock.calls[0]?.[0].length).toBeLessThan(4100)
  })
 })
