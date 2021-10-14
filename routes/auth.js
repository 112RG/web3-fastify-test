const ethSigUtil = require('eth-sig-util')
const ethUtil = require('ethereumjs-util')
const { User } = require('../models/user')
module.exports = function (fastify, opts, done) {
  fastify.get('/publicNonce', async (req, reply) => {
    const user = await User.findOne({ publicAddress: req.query.publicAddress })
    console.log(user)
    return reply.send(user.nonce)
  })

  fastify.post('/ethLogin', {
    schema: {
      summary: 'Login',
      body: {
        type: 'object',
        properties: {
          signature: { type: 'string' },
          publicAddress: { type: 'string' }
        },
        required: ['signature', 'publicAddress']
      }
    }
  }, async (req, reply) => {
    const user = await User.findOne({ publicAddress: req.body.publicAddress })

    console.log(`Signed string ${req.body.signature}`)
    console.log(`Public Address ${req.body.publicAddress}`)

    // Nonce the user signed
    // We now are in possession of msg, publicAddress and signature. We
    // will use a helper from eth-sig-util to extract the address from the signature
    const msgBufferHex = ethUtil.bufferToHex(Buffer.from(user.nonce, 'utf8'))
    const address = ethSigUtil.recoverPersonalSignature({
      data: msgBufferHex,
      sig: req.body.signature
    })

    // The signature verification is successful if the address found with
    // sigUtil.recoverPersonalSignature matches the initial publicAddress
    if (address.toLowerCase() === req.body.publicAddress.toLowerCase()) {
      console.log('Success')
      reply.send('Success')
    } else {
      console.log('Failed')
      reply.status(401).send({
        error: 'Signature verification failed'
      })
    }
  })
  done()
}
