// third-party
const mongoose = require('mongoose');

// constants
const Schema = mongoose.Schema;

var lockSchema = new Schema({

});

// takes the connection and options and returns the model
module.exports = function (conn, options) {

  if (!options.lockModelName) { throw new Error('options.lockModelName is required'); }

  var Lock = conn.model(options.lockModelName, lockSchema);
  
  return Lock;
};