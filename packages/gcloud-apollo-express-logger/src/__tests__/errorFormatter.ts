import { AuthenticationError, ForbiddenError } from 'apollo-server-express'
import { GraphQLError } from 'graphql'
import { errorFormatter } from '../index'

const _ = undefined

describe('errorFormatter', () => {
  it('formats error object', () => {
    const graphqlError = new GraphQLError('message')
    const formattedError = errorFormatter()(graphqlError)
    expect(formattedError.message).toBe('message')
  })

  it('formats error object with unknown error', () => {
    const graphqlError = new GraphQLError('', _, _, _, _, _, {})
    const formattedError = errorFormatter()(graphqlError)
    expect(formattedError.extensions).toEqual({
      exception: { code: 500, message: 'Server error' },
    })
  })

  it('formats ForbiddenError', () => {
    const forbiddenError = new ForbiddenError('Forbidden')
    const formattedError = errorFormatter()(forbiddenError)
    expect(formattedError.extensions).toEqual({
      code: 'FORBIDDEN',
      exception: {
        code: 403,
        message: 'Forbidden error',
      },
    })
  })

  it('formats AuthenticationError', () => {
    const authenticationError = new AuthenticationError('Unauthenticated')
    const formattedError = errorFormatter()(authenticationError)
    expect(formattedError.extensions).toEqual({
      code: 'UNAUTHENTICATED',
      exception: {
        code: 401,
        message: 'Authentication error',
      },
    })
  })

  const extensions = {
    exception: {
      code: '400',
      secret: 'secret1',
    },
  }

  it('whitelist > picks specified error fields', () => {
    const graphqlError = new GraphQLError('', _, _, _, _, _, extensions)
    const formattedError = errorFormatter({ whiteList: ['code'] })(graphqlError)
    expect(formattedError.extensions).toEqual({ exception: { code: '400' } })
  })

  it('blackList > omits specified error fields', () => {
    const graphqlError = new GraphQLError('', _, _, _, _, _, extensions)
    const formattedError = errorFormatter({ blackList: ['secret'] })(graphqlError)
    expect(formattedError.extensions).toEqual({ exception: { code: '400' } })
  })
})
