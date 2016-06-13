// native dependencies

// third-party dependencies

module.exports = function (hLock, options) {

  var Lock = hLock.models.Lock;

  return function (name, reason) {
    if (!name) { return Promise.reject(new hLock.errors.InvalidLockName('lock name is required for unlocking')); }

    return Lock.findOne({ name: name })
      .then((lock) => {

        if (!lock) { return Promise.reject(new hLock.errors.InexistentLockName('lock ' + name + ' does not exist')); }

        lock.set('_status', {
          value: 'disabled',
          reason: reason
        });

        return lock.save();
      })
      .then(() => {
        // make sure returns undefined
        return;
      });
  };
};