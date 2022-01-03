import { pick, omit } from '../utils'

const object = {
  1: 1,
  key: 'key',
  2: 2,
  other: 'other',
}

const keys: (keyof typeof object)[] = [1, 'key']

describe('pick', () => {
  it('picks provided keys', () => {
    expect(pick(object, keys)).toEqual({ 1: 1, key: 'key' })
  })
})

describe('omit', () => {
  it('omitss provided keys', () => {
    expect(omit(object, keys)).toEqual({ 2: 2, other: 'other' })
  })
})
