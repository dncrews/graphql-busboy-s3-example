
const _get = require('lodash.get')
const { BusboyStream } = require('./busboy-stream')

exports.busboyMiddleware = () => {
  return async (req, res, next) => {
    if (req.method !== 'POST') {
      return next()
    }

    if (!_get(req, 'headers.content-type', '').startsWith('multipart/form-data')) {
      return next()
    }

    const busboy = new BusboyStream(req)

    try {
      await busboy.ready
      return next()
    } catch (e) {
      return next(e)
    }
  }
}
