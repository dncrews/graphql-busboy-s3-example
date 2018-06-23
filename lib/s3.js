const assert = require('assert')
const AWS = require('aws-sdk')

const config = require('./config')

AWS.config.apiVersions = {
  s3: '2006-03-01'
}
if (config.s3.region) {
  AWS.config.region = config.s3.region
}

const s3 = new AWS.S3()

const {
  bucket,
  prefix,
  partSize,
  queueSize,
  urlExpirationTime
} = config.s3

const toS3Parts = /^([^/]*)\/(.*)/

assert(bucket && bucket.length > 0, 'Please set the bucket name in ./lib/config')

exports.parsePath = (path) => {
  const s3Parts = path.match(toS3Parts)

  if (!(s3Parts && s3Parts.length === 3)) {
    throw new Error('Upload not found')
  }
  return {
    bucket: s3Parts[1],
    key: s3Parts[2]
  }
}

exports.signedUrl = ({ bucket, key }) => {
  return s3.getSignedUrl('getObject', {
    Bucket: bucket,
    Key: key,
    Expires: urlExpirationTime
  })
}

exports.uploadFile = ({ filename, file, mimetype }) => {
  const key = `${prefix}/${filename}`
  const s3 = new AWS.S3({
    params: {
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: mimetype
    },
    options: {
      partSize,
      queueSize
    }
  })

  return s3.upload().promise()
}
