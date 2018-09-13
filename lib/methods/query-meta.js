// native dependencies

// third-party dependencies

module.exports = function (hLock, options) {

  var Lock = hLock.models.Lock;

  return function queryMeta(metaQuery) {

    var query = {};

    for (var prop in metaQuery) {
      query['meta.' + prop] = metaQuery[prop];
    }

    return Lock.find(query).then((locks) => {
      return locks.map((lock) => {
        return lock._id.toString();
      });
    });

  };
};