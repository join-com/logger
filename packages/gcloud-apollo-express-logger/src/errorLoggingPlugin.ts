import { logger } from '@join-com/gcloud-logger-trace'
import { ApolloServerPlugin, GraphQLRequestContext } from 'apollo-server-plugin-base'

export const errorLoggingPlugin: ApolloServerPlugin = {
  requestDidStart() {
    return Promise.resolve({
      didEncounterErrors({ errors = [] }: GraphQLRequestContext) {
        const errorMessages = errors.map(e => e.message).join(', ')
        logger.warn(`Encountered errors when processing GraphQL request: [${errorMessages}]`, errors)
        return Promise.resolve()
      },
    })
  },
}
