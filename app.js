
const bodyParser = require('body-parser')
const express = require('express')

const config = require('./lib/config')
const { graphqlMiddleware } = require('./graphql')
const { busboyMiddleware } = require('./lib/busboy')

const app = express()
const port = config.port || 5000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/graphql', busboyMiddleware(), graphqlMiddleware())

app.listen(port, () => {
  console.info('app listening at: http://localhost:5000')
})
