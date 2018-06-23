
const Busboy = require('busboy')

const s3 = require('./s3')

const FilePromises = Symbol('filePromises')
const Bound = Symbol('bound')

class BusboyStream {
  constructor (req) {
    const busboy = this.busboy = new Busboy({ headers: req.headers })

    if (!req.context) req.context = req.context = {}
    if (!req.context.uploads) req.context.uploads = {}

    this.req = req

    this.listen()
    this.processFile = this.processFile.bind(this)

    req.pipe(busboy)
  }

  bindFields () {
    const req = this.req

    this.busboy.on('field', (fieldname, value) => {
      if (!req.body) req.body = {}
      const finalBody = req.body

      let parsed
      try {
        parsed = JSON.parse(value)
      } catch (e) {
        parsed = value
      }

      finalBody[fieldname] = parsed
    })
  }

  bindFiles () {
    const busboy = this.busboy
    const filePromises = this[FilePromises]

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const startTime = Date.now()

      const filePromise = s3.uploadFile({ filename, file, mimetype })
        .then(this.processFile(fieldname))
        .catch((err) => {
          console.error('upload failed', err)
          throw err
        })

      filePromise.then((item) => {
        const endTime = Date.now()
        console.info(`upload of ${item.key} took: ${endTime - startTime}ms`)
      })

      filePromises.push(filePromise)
    })
  }

  listen () {
    this[Bound] = new Promise((resolve) => {
      this.busboy.on('finish', resolve)
    })
    this[FilePromises] = []

    this.bindFields()
    this.bindFiles()
  }

  processFile (fieldname) {
    return (response) => {
      const finalUploads = this.req.context.uploads
      let existing = finalUploads[fieldname]

      const item = {
        bucket: response.Bucket,
        key: response.Key,
        expiration: response.Expiration
      }

      // If more than one file is uploaded with that name, make it an array
      if (!existing) {
        finalUploads[fieldname] = item
        return item
      }

      if (!Array.isArray(existing)) {
        existing = finalUploads[fieldname] = [ existing ]
      }

      existing.push(item)
      return item
    }
  }

  get filesPromise () {
    return Promise.all(this[FilePromises])
  }

  get ready () {
    return this[Bound]
      .then(() => {
        return this.filesPromise
      })
  }
}

exports.BusboyStream = BusboyStream
