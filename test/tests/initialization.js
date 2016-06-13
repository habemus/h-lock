const assert = require('assert');
const should = require('should');

const mongoose = require('mongoose');

const hToken = require('../../lib');

// auxiliary
const aux = require('../auxiliary');

const REQUIRED_OPTIONS = {
  mongooseConnection: mongoose.createConnection(aux.TEST_DB_URI),
  lockModelName: 'TestLock',
};

function _clone(obj) {
  var cloneObj = {};

  for (prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      cloneObj[prop] = obj[prop];
    }
  }

  return cloneObj;
}

describe('initialization', function () {
  it('should require mongooseConnection option', function () {
    var options = _clone(REQUIRED_OPTIONS);
    delete options.mongooseConnection;

    assert.throws(function () {
      var ht = hToken(options);
    });
  });

  it('should require lockModelName option', function () {
    var options = _clone(REQUIRED_OPTIONS);
    delete options.lockModelName;

    assert.throws(function () {
      var ht = hToken(options);
    });
  });
  
  it('should initialize correctly in case all required options are passed', function () {
    var ht = hToken(REQUIRED_OPTIONS);
  });

  it('should throw error if `unlockFailureCountMode` is provided and is invalid', function () {
    var options = _clone(REQUIRED_OPTIONS);

    options.unlockFailureCountMode = 'INVALID';

    assert.throws(function () {
      var ht = hToken(options);
    });

  });
});