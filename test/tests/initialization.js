const assert = require('assert');
const should = require('should');

const mongoose = require('mongoose');

const hToken = require('../../lib');

// auxiliary
const dbConn = require('../auxiliary/db-conn');

const REQUIRED_OPTIONS = {
  mongooseConnection: dbConn.mongooseConnection,
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
});