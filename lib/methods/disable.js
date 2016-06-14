// native dependencies

// third-party dependencies
const Bluebird = require('bluebird');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (hLock, options) {

  var Lock = hLock.models.Lock;

  return function (lockId, reason) {
    if (!ObjectId.isValid(lockId)) { return Bluebird.reject(new hLock.errors.InvalidLockId('invalid lockid')); }

    return Bluebird.resolve(Lock.findOne({ _id: lockId }))
      .then((lock) => {

        if (!lock) { return Bluebird.reject(new hLock.errors.InexistentLock('lock ' + lockId + ' does not exist')); }

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