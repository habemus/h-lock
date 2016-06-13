// native dependencies

// third-party dependencies

module.exports = function (hLock, options) {

  var Lock = hLock.models.Lock;

  return function (name, secret) {
    if (!name) { return Promise.reject(new hLock.errors.InvalidLockName('lock name is required for unlocking')); }
    if (!secret) { return Promise.reject(new hLock.errors.InvalidLockSecret('lock secret is required for unlocking')); }

    // create variable to store the lock model for later usage
    var _lock

    return Lock.findOne({ name: name })
      .then((lock) => {

        if (!lock) {
          return Promise.reject(new hLock.errors.InexistentLockName('lock ' + name + ' does not exist'));
        }

        _lock = lock;

        // hash the secret
        return Lock.hashSecret(secret);
      })
      .then((hash) => {
        _lock._hash = hash;

        return _lock.save();
      })
      .then((lock) => {
        // make sure to return nothing
        return;
      });
  };
};