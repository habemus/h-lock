// native dependencies

// third-party dependencies
const mongoose = require('mongoose');

const ValidationError = mongoose.Error.ValidationError;
const ValidatorError  = mongoose.Error.ValidatorError;


module.exports = function (hLock, options) {

  var Lock = hLock.models.Lock;

  return function (secret, lockOptions) {

    lockOptions = lockOptions || {};

    var lock = new Lock();

    if (lockOptions.meta) {
      lock.set('meta', lockOptions.meta);
    }

    // generate the hash
    return Lock.hashSecret(secret)
      .then((hash) => {
        lock.set('_hash', hash);

        return lock.save();
      })
      .then(() => {

        // only return the id
        return lock.get('_id').toString();
      });
  };
};