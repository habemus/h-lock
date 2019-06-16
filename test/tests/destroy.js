const assert = require('assert');

// third-party dependencies
const should = require('should');
const ObjectId = require('mongoose').Types.ObjectId;

// lib
const hLock = require('../../lib');

// auxiliary
const aux    = require('../auxiliary');

describe('hLock#destroy', function () {

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
      .then((locks) => {

        ASSETS.lockId1 = locks[0];
        ASSETS.lockId2 = locks[1];
        ASSETS.lockId3 = locks[2];

        done();
      })
      .catch(done);
  });

  afterEach(function (done) {
    aux.teardown(ASSETS).then(() => { done(); });
  });

  it('should remove the lock from the database', function (done) {

    var promise = ASSETS.hl.destroy(ASSETS.lockId1);

    promise.should.be.instanceof(Promise);

    promise.then((result) => {

        should(result).be.undefined();

        // check that lock-1 has been removed from the database
        return ASSETS.db.collection('testlocks').find({ _id: ASSETS.lockId1 }).toArray();
      })
      .then((locks) => {
        locks.length.should.equal(0);

        // check that it is not possible to unlock lock-1 anymore
        return ASSETS.hl.unlock(ASSETS.lockId1, 'secret-1', 'attempter');
      })
      .then(() => {
        done(new Error('expected error'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InexistentLock);

        done();
      })
      .catch(done);
  });

  it('should allow removing a lock that does not exist', function (done) {
    var promise = ASSETS.hl.destroy(new ObjectId().toString());

    promise.should.be.instanceof(Promise);

    promise.then((result) => {
        should(result).be.undefined();

        // check that the number of locks in the database remains the same
        return ASSETS.db.collection('testlocks').find().toArray();
      })
      .then((locks) => {
        locks.length.should.equal(3);

        done();
      })
      .catch(done);
  });

  it('should require a lockId', function (done) {
    var promise = ASSETS.hl.destroy(undefined);

    promise.should.be.instanceof(Promise);

    promise.then(() => {
        done(new Error('error expected'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidLockId);

        done();

      })
      .catch(done);
  });

});