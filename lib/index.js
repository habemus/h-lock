// native dependencies

// external dependencies
const mongoose  = require('mongoose');

/**
 * Function that starts the host server
 */
function createHLock(options) {
  if (!options.mongooseConnection) { throw new Error('mongooseConnection is required'); }

  var conn = options.mongooseConnection;

  var hLock = {};

  // make errors avaible
  hLock.errors = require('./errors');

  // load models
  hLock.models = {};
  hLock.models.Lock = require('./models/lock')(conn, hLock, options);

  hLock.create  = require('./methods/create')(hLock, options);
  hLock.destroy = require('./methods/destroy')(hLock, options);
  hLock.unlock  = require('./methods/unlock')(hLock, options);
  hLock.reset   = require('./methods/reset')(hLock, options);

  return hLock;
}

createHLock.errors = require('./errors');

module.exports = createHLock;