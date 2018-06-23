
const { graphqlExpress } = require('apollo-server-express')
const { makeExecutableSchema } = require('graphql-tools')

const { typeDefs } = require('./typeDefs')
const { resolvers } = require('./resolvers')

exports.graphqlMiddleware = () => {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  })

  return graphqlExpress((req) => {
    return {
      schema,
      context: req.context
    }
  })
}
