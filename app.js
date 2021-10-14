'use strict'

require('dotenv').config()
const path = require('path')
const pino = require('pino')
const logger = pino({
  prettyPrint: { colorize: true },
  level: 'debug'
})
const fastify = require('fastify')

/* istanbul ignore next */
function buildFastify() {
  const serverInstance = fastify({
    logger: logger
  })
  serverInstance.register(require('point-of-view'), {
    engine: {
      pug: require('pug')

    },
    root: path.join(__dirname, 'views'),
    viewExt: 'pug'
  })
  serverInstance.register(require('fastify-static'), {
    root: path.join(__dirname, './static'),
    maxAge: '365d',
    immutable: true,
    cacheControl: true
  })
  serverInstance.register(require('./plugins/mongoConnector'))
  serverInstance.register(require('fastify-routes'))
  // Register routes
  serverInstance.register(require('./routes/index'))
  serverInstance.register(require('./routes/auth'), { prefix: '/api/auth' })

  return serverInstance
}

/* istanbul ignore next */
async function start(server) {
  const signals = ['SIGINT', 'SIGTERM']
  signals.forEach((signal) => {
    process.once(signal, async () => {
      await server.close()
      server.log.info('Closing server')
      process.exit(0)
    })
  })
  server.listen(3000, '0.0.0.0', (err, address) => {
    if (err) {
      server.log.error(err)
      process.exit(1)
    }
  })
}
module.exports = { buildFastify, start }
