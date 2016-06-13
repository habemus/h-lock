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

  it('should unlock if the secret is correct', function (done) {
    ASSETS.hl.unlock('lock-1', 'secret-1')
      .then((result) => {

        // make sure the unlock function returns undefined.
        // if unlocking fails, it will fail the promise itself
        should(result).be.undefined();

        done();
      })
      .catch(done);
  });

  it('should fail if secret is incorrect', function (done) {
    ASSETS.hl.unlock('lock-1', 'secret-2')
      .then(() => {
        done(new Error('expected error'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidSecret);
        err.name.should.equal('InvalidSecret');

        done();
      })
      .catch(done);
  });

  it('should fail if lock name does not exist', function (done) {
    ASSETS.hl.unlock('lock-that-does-not-exist', 'secret-2')
      .then(() => {
        done(new Error('expected error'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InexistentLockName);
        err.name.should.equal('InexistentLockName');

        done();
      })
      .catch(done);
  });

  it('should fail if no lockname is passed', function (done) {
    ASSETS.hl.unlock(undefined, 'secret-2')
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
    ASSETS.hl.unlock('lock-1', undefined)
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