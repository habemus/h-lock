// native dependencies

// third-party dependencies

module.exports = function (hLock, options) {

  var Lock = hLock.models.Lock;

  return function (lockId, secret) {
    if (!lockId) { return Promise.reject(new hLock.errors.InvalidLockId('lockId is required for unlocking')); }
    if (!secret) { return Promise.reject(new hLock.errors.InvalidLockSecret('lock secret is required for unlocking')); }

    // create variable to store the lock model for later usage
    var _lock

    return Lock.findOne({ _id: lockId })
      .then((lock) => {

        if (!lock) {
          return Promise.reject(new hLock.errors.InexistentLock('lock ' + lockId + ' does not exist'));
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