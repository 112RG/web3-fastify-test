'use strict'
const { buildFastify, start } = require('./app')
async function run() {
  await start(buildFastify())
}
run().catch((error) => console.error(error))
