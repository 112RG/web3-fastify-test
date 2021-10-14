const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const SALT = 10
const utils = require('../utils/')
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  api_key: {
    type: String,
    unique: true,
    default: function () {
      return utils.genKey(40)
    }
  },
  publicAddress: {
    type: String,
    unique: false
  },
  nonce: {
    type: String,
    unique: true,
    default: function () {
      return utils.genKey(40)
    }
  },
  reauth: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    required: false
  },
  loggedIps: {
    type: [String],
    required: false
  }
})
userSchema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    bcrypt.genSalt(SALT, function (err, salt) {
      /* istanbul ignore next */
      if (err) return next(err)

      bcrypt.hash(user.password, salt, function (err, hash) {
        /* istanbul ignore next */
        if (err) return next(err)
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}
const User = mongoose.model('User', userSchema)

module.exports = { User }
