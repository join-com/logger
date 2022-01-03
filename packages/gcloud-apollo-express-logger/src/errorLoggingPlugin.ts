import { logger } from '@join-com/gcloud-logger-trace'
import { ApolloServerPlugin, GraphQLRequestContext, GraphQLRequestListener } from 'apollo-server-plugin-base'

export const errorLoggingPlugin: ApolloServerPlugin & GraphQLRequestListener = {
  requestDidStart() {
    return Promise.resolve(this)
  },
  didEncounterErrors({ errors = [] }: GraphQLRequestContext) {
    const errorMessages = errors.map(e => e.message).join(', ')
    logger.warn(`Encountered errors when processing GraphQL request: [${errorMessages}]`, errors)
    return Promise.resolve()
  },
}
