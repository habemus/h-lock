// native dependencies

// third-party dependencies

module.exports = function (hLock, options) {

  var Lock = hLock.models.Lock;

  return function (id, secret) {

    var lock = new Lock();

    return lock.save()
      .then((lockData) => {

        // only return the id
        return lockData.get('_id');
      });
  };
};