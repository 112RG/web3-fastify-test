const { User } = require('../models/user')

module.exports = function (fastify, opts, done) {
  fastify.get('/', async (req, reply) => {
    console.log(fastify.routes)
    return reply.view('login')
  })
  fastify.get('/user', async (req, reply) => {
    await User.create({
      email: 'test',
      password: 'a',
      publicAddress: req.query.public
    })
    return reply.send('made')
  })
  done()
}
