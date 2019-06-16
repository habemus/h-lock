const assert = require('assert');

// third-party dependencies
const should = require('should');
const ObjectId = require('mongoose').Types.ObjectId;

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
        var lock1 = ASSETS.hl.create('secret-1');
        var lock2 = ASSETS.hl.create('secret-2');
        var lock3 = ASSETS.hl.create('secret-3');

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
    aux.teardown(ASSETS).then(() => { done(); });
  });

  it('should set the lock\'s status to disabled', function (done) {
    ASSETS.hl.disable(ASSETS.lockId1, 'SOME_REASON')
      .then((result) => {

        should(result).be.undefined();

        // check that lock-1 has been removed from the database
        return ASSETS.db.collection('testlocks').find({ _id: new ObjectId(ASSETS.lockId1) }).toArray();
      })
      .then((locks) => {

        locks.length.should.equal(1);

        // check lock's status
        locks[0]._status.value.should.equal('disabled');
        locks[0]._status.reason.should.equal('SOME_REASON');

        // check that it is not possible to unlock lock-1 anymore
        return ASSETS.hl.unlock(ASSETS.lockId1, 'secret-1', 'attempter');
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
    ASSETS.hl.disable(new ObjectId().toString(), 'SOME_REASON')
      .then(() => {
        done(new Error('error expected'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InexistentLock);

        done();
      })
      .catch(done);
  });

  it('require lockId', function (done) {
    ASSETS.hl.disable(undefined, 'SOME_REASON')
      .then(() => {
        done(new Error('error expected'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidLockId);

        done();
      })
      .catch(done);
  });

});