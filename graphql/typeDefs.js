
const gql = require('graphql-tag')

exports.typeDefs = gql`
  scalar DateTime
  scalar UploadFile

  type Query {
    node(id: ID!): Node
  }

  type Mutation {
    upload(input: UploadInput): UploadPayload
  }

  interface Node {
    id: ID!
  }

  type Upload implements Node {
    id: ID!
    url: String!
    urlExpiration: DateTime!
  }

  input UploadInput {
    clientMutationId: String
    file: UploadFile!
  }

  type UploadPayload {
    clientMutationId: String
    upload: Upload!
  }
`
