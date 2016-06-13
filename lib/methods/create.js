// native dependencies

// third-party dependencies
const mongoose = require('mongoose');

const ValidationError = mongoose.Error.ValidationError;
const ValidatorError  = mongoose.Error.ValidatorError;


module.exports = function (hLock, options) {

  var Lock = hLock.models.Lock;

  return function (name, secret, options) {

    var lock = new Lock({
      name: name
    });

    // generate the hash
    return Lock.hashSecret(secret)
      .then((hash) => {
        lock.set('_hash', hash);

        return lock.save();
      })
      .then(() => {

        // only return the id
        return lock.get('_id');
      }, function (err) {
        
        // failed to create lock
        
        if (err.name === 'MongoError' && err.code === 11000) {
          // TODO: improvement research:
          // for now we infer that any 11000 error (duplicate key)
          // refers to lockname repetition

          return Promise.reject(new hLock.errors.NonUniqueLockName('lock name must be unique'));
        }

        // check if the error is a mongoose validation error
        if (err instanceof ValidationError) {

          if (err.errors.hasOwnProperty('name') && err.errors.name.kind === 'required') {
            // error at name
            return Promise.reject(new hLock.errors.MissingLockName('lock name is required'));

          } else if (err.errors.hasOwnProperty('_hash') && err.errors._hash.kind === 'required') {
            // secret is missing
            return Promise.reject(new hLock.errors.MissingLockSecret('lock secret is required'));
          }
        }
        
        // always throw the error
        return Promise.reject(err);
      });
  };
};