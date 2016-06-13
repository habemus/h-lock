// native dependencies

// third-party dependencies

module.exports = function (hLock, options) {

  var Lock = hLock.models.Lock;

  return function (name, secret) {
    if (!name) { return Promise.reject(new hLock.errors.MissingLockName('lock name is required for unlocking')); }
    if (!secret) { return Promise.reject(new hLock.errors.MissingLockSecret('lock secret is required for unlocking')); }

    var _lock;

    return Lock.findOne({ name: name })
      .then((lock) => {
        if (!lock) {
          return Promise.reject(new hLock.errors.InexistentLockName('lock ' + name + ' does not exist'));
        }

        // store the lock for later usage
        _lock = lock;

        return _lock.validateSecret(secret);
      })
      .then((isValid) => {
        if (!isValid) {
          return Promise.reject(new hLock.errors.InvalidSecret('invalid secret'));
        }
      });
  };
};