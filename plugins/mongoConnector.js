'use strict'
const fastifyPlugin = require('fastify-plugin')
const mongoose = require('mongoose')
const MONGOURL = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOSTNAME}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`
// Connect to DB
function dbConnector(fastify, options, next) {
  let isConnectedBefore = false
  const connect = function () {
    mongoose.connect(process.env.MONGO_URL || MONGOURL, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })
  }
  connect()
  mongoose.connection.on('error', (err) => {
    /* istanbul ignore next */
    console.log(err, 'Mongoose connection error')
    mongoose.connection.close()
  })
  mongoose.connection.on('disconnected', () => {
    if (!isConnectedBefore) { connect() }
    console.log('Disconnected from mongodb')
  })
  mongoose.connection.on('connected', () => {
    isConnectedBefore = true
    console.log('Connected to Mongo')
    if (!fastify.mongo) {
      fastify.decorate('mongo', mongoose)
    }
    next()
  })
  fastify.addHook('onClose', (fastify, done) => {
    console.log('Closing Mongo connection')
    mongoose.connection.close()
    console.log('Closed Mongo connection')
    done()
  })
}
module.exports = fastifyPlugin(dbConnector)
