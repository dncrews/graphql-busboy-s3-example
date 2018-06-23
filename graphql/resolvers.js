
const { GraphQLDateTime } = require('graphql-custom-types')
const { fromGlobalId, toGlobalId } = require('graphql-relay')
const _get = require('lodash.get')
const config = require('../lib/config')
const s3 = require('../lib/s3')

const { urlExpirationTime } = config.s3

exports.resolvers = {
  Query: {
    node (source, args, context) {
      const { id } = fromGlobalId(args.id)
      const { bucket, key } = s3.parsePath(id)

      return {
        bucket,
        key
      }
    }
  },
  Mutation: {
    upload (source, args, context) {
      const { clientMutationId, file } = args.input

      const upload = _get(context, `uploads.${file}`)
      if (Array.isArray(upload)) {
        throw new Error(`Upload: "${file}" is an array of results`)
      }
      if (!upload) {
        throw new Error(`Upload: "${file}" was not found. Did you use multipart/form-data?`)
      }

      return {
        clientMutationId,
        upload
      }
    }
  },
  DateTime: GraphQLDateTime,
  Node: {
    __resolveType () {
      return 'Upload'
    }
  },
  Upload: {
    id (source) {
      return toGlobalId('Upload', `${source.bucket}/${source.key}`)
    },
    url (source) {
      const { bucket, key } = source

      return s3.signedUrl({
        bucket,
        key
      })
    },
    urlExpiration () {
      const now = Date.now()
      const end = urlExpirationTime * 1000

      return now + end
    }
  }
}
