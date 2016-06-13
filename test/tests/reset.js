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

  it('should change the secret of the lock', function (done) {
    ASSETS.hl.reset('lock-1', 'another-secret')
      .then((result) => {

        // make sure the unlock function returns undefined.
        // if unlocking fails, it will fail the promise itself
        should(result).be.undefined();

        // check that the lock's secret has been changed
        return ASSETS.hl.unlock('lock-1', 'another-secret');
      })
      .then(() => {
        done();
      })
      .catch(done);
  });

  it('should fail to change the secret of a lock that does not exist', function (done) {
    ASSETS.hl.reset('lock-that-does-not-exist', 'another-secret')
      .then(() => {
        done(new Error('expected error'));
      }, (err) => {

        err.should.be.instanceof(hLock.errors.InexistentLockName);

        done();
      })
      .catch(done);
  });

  it('should fail if no lockname is passed', function (done) {
    ASSETS.hl.reset(undefined, 'another-secret')
      .then(() => {
        done(new Error('expected error'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.MissingLockName);
        err.name.should.equal('MissingLockName');

        done();
      })
      .catch(done);
  });

  it('should fail if no secret is passed', function (done) {
    ASSETS.hl.reset('lock-1', undefined)
      .then(() => {
        done(new Error('expected error'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.MissingLockSecret);
        err.name.should.equal('MissingLockSecret');

        done();
      })
      .catch(done);
  });
});