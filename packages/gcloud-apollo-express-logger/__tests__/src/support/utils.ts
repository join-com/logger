import { pick } from '../../../support/utils';

describe('pick', () => {
  it('pick provided keys', () => {
    const object = {
      1: 1,
      key: 'key',
      2: 2,
      other: 'other',
    };
    const keys = [1, 'key'];
    expect(pick(object, keys)).toEqual({ 1: 1, key: 'key' });
  });
});
