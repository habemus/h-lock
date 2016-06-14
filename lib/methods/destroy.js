// native dependencies

// third-party dependencies
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (hLock, options) {

  var Lock = hLock.models.Lock;

  return function (lockId) {
    if (!ObjectId.isValid(lockId)) { return Promise.reject(new hLock.errors.InvalidLockId('invalid lock id')); }

    return Lock.findOneAndRemove({ _id: lockId })
      .then((removedLock) => {
        // make sure to return nothing
        return;
      });
  };
};