// native dependencies

// third-party dependencies

module.exports = function (hLock, options) {

  var Lock = hLock.models.Lock;

  return function (name) {
    return Lock.findOneAndRemove({ name: name })
      .then((removedLock) => {
        // make sure to return nothing
        return;
      });
  };
};