const assert = require('assert');

// third-party dependencies
const Bluebird = require('bluebird');
const should = require('should');

// lib
const hLock = require('../../lib');

// auxiliary
const aux    = require('../auxiliary');

describe('hLock#queryMeta', function () {

  var ASSETS;

  beforeEach(function (done) {
    aux.setup()
      .then((assets) => {
        ASSETS = assets;

        ASSETS.hl = hLock({
          mongooseConnection: ASSETS.mongooseConnection,
          lockModelName: 'TestLock',
        });

        // create some locks
        var lock1 = ASSETS.hl.create('secret-1', {
          meta: {
            key1: 'value11',
            key2: 'value21',
          }
        });
        var lock2 = ASSETS.hl.create('secret-2', {
          meta: {
            key1: 'value11',
            key2: 'value22',
          }
        });
        var lock3 = ASSETS.hl.create('secret-3', {
          meta: {
            key1: 'value12',
            key2: 'value21',
          }
        });

        return Promise.all([lock1, lock2, lock3]);
      })
      .then((lockIds) => {

        ASSETS.lockId1 = lockIds[0];
        ASSETS.lockId2 = lockIds[1];
        ASSETS.lockId3 = lockIds[2];

        done();
      })
      .catch(done);
  });

  afterEach(function (done) {
    aux.teardown().then(() => { done(); });
  });

  it('should retrieve lockIds that match a given meta query', function () {

    return ASSETS.hl.queryMeta({
      key1: 'value11'
    })
    .then((lockIds) => {
      lockIds.length.should.eql(2);
      lockIds.indexOf(ASSETS.lockId1.toString()).should.not.eql(-1);
      lockIds.indexOf(ASSETS.lockId2.toString()).should.not.eql(-1);
    });

  });
});