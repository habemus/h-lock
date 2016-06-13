const assert = require('assert');

// third-party dependencies
const should = require('should');

// lib
const hLock = require('../../lib');

// auxiliary
const aux    = require('../auxiliary');

describe('hLock#unlock', function () {

  var ASSETS = {};

  beforeEach(function (done) {

    aux.setup()
      .then((assets) => {
        ASSETS = assets;

        ASSETS.hl = hLock({
          mongooseConnection: ASSETS.mongooseConnection,
          lockModelName: 'TestLock',
        });

        // create some locks
        var lock1 = ASSETS.hl.create('lock-1', 'secret-1');
        var lock2 = ASSETS.hl.create('lock-2', 'secret-2');
        var lock3 = ASSETS.hl.create('lock-3', 'secret-3');

        return Promise.all([lock1, lock2, lock3]);
      })
      .then(() => {
        done();
      })
      .catch(done);
  });

  afterEach(function (done) {
    aux.teardown().then(() => { done(); });
  });

  it('should remove the lock from the database', function (done) {
    ASSETS.hl.destroy('lock-1')
      .then((result) => {

        should(result).be.undefined();

        done();
      })
      .catch(done);
  });

  it('should allow removing to remove a lock that does not exist', function (done) {

    ASSETS.hl.destroy('lock-that-does-not-exist')
      .then((result) => {

        should(result).be.undefined();

        done();
      })
      .catch(done);
  });

});