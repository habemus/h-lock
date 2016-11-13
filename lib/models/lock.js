// third-party
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const Bluebird = require('bluebird');

const Schema = mongoose.Schema;

// constants
const DEFAULT_SALT_ROUNDS = 10;

// promisified methods
const _bcryptHash    = Bluebird.promisify(bcrypt.hash);
const _bcryptCompare = Bluebird.promisify(bcrypt.compare);

/**
 * The schema object for the lock
 * @type {Schema}
 */
var lockSchema = new Schema({

  _hash: {
    type: String,
    required: true
  },

  _status: {
    value: {
      type: String,
      default: 'enabled',
    },
    reason: {
      type: String,
    }
  },

  _unlockFailureCount: {
    type: Number,
    default: 0,
  },

  meta: Object
});

// takes the connection and options and returns the model
module.exports = function (conn, hLock, options) {
  const saltRounds = options.saltRounds || DEFAULT_SALT_ROUNDS;

  /**
   * Checks the secret agains hash using bcrypt
   * @param  {String} plainTextSecret
   * @return {Bluebird -> Boolean}
   */
  lockSchema.methods.validateSecret = function (plainTextSecret) {

    var hash = this._hash;

    return _bcryptCompare(plainTextSecret, hash);
  };

  /**
   * Hashes a secret
   * @param  {String} plainTextSecret
   * @return {Bluebird -> Hash}
   */
  lockSchema.statics.hashSecret = function (plainTextSecret) {
    if (!plainTextSecret) {
      return Bluebird.reject(new hLock.errors.InvalidLockSecret('lock secret is required'));
    } else {
      return _bcryptHash(plainTextSecret, saltRounds);
    }
  };

  var Lock = conn.model(options.lockModelName, lockSchema);
  
  return Lock;
};