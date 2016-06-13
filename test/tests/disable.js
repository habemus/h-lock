const assert = require('assert');

// third-party dependencies
const should = require('should');

// lib
const hLock = require('../../lib');

// auxiliary
const aux    = require('../auxiliary');

describe('hLock#disable', function () {

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

  it('should set the lock\'s status to disabled', function (done) {
    ASSETS.hl.disable('lock-1', 'SOME_REASON')
      .then((result) => {

        should(result).be.undefined();

        // check that lock-1 has been removed from the database
        return ASSETS.db.collection('testlocks').find({ name: 'lock-1' }).toArray();
      })
      .then((locks) => {
        locks.length.should.equal(1);

        // check lock's status
        locks[0]._status.value.should.equal('disabled');
        locks[0]._status.reason.should.equal('SOME_REASON');

        // check that it is not possible to unlock lock-1 anymore
        return ASSETS.hl.unlock('lock-1', 'secret-1', 'attempter');
      })
      .then(() => {
        done(new Error('expected error'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.LockPermanentlyDisabled);
        err.reason.should.equal('SOME_REASON');

        done();
      })
      .catch(done);
  });

  it('should fail if trying to disable lock that does not exist', function (done) {
    ASSETS.hl.disable('lock-that-does-not-exist', 'SOME_REASON')
      .then(() => {
        done(new Error('error expected'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InexistentLockName);

        done();
      })
      .catch(done);
  });

  it('require lockName', function (done) {
    ASSETS.hl.disable(undefined, 'SOME_REASON')
      .then(() => {
        done(new Error('error expected'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidLockName);

        done();
      })
      .catch(done);
  });

});