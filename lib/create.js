// native dependencies

// third-party dependencies

module.exports = function (hLock, options) {

  var Lock = hLock.models.Lock;

  return function (id, secret, options) {

    var lock = new Lock();
  };
};