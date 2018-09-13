// native dependencies

// third-party dependencies
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (hLock, options) {

  var Lock = hLock.models.Lock;

  return function (lockId, reason) {
    if (!ObjectId.isValid(lockId)) { return Promise.reject(new hLock.errors.InvalidLockId('invalid lockid')); }

    return Promise.resolve(Lock.findOne({ _id: lockId }))
      .then((lock) => {

        if (!lock) { return Promise.reject(new hLock.errors.InexistentLock('lock ' + lockId + ' does not exist')); }

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