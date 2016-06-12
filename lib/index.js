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

  // load models
  hLock.models = {};
  hLock.models.Lock = require('./models/lock')(conn, options);

  return hLock;
}

createHLock.errors = require('./errors');

module.exports = createHLock;