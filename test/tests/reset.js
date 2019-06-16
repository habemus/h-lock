const assert = require('assert');

// third-party dependencies
const should = require('should');
const ObjectId = require('mongoose').Types.ObjectId;

// lib
const hLock = require('../../lib');

// auxiliary
const aux    = require('../auxiliary');

describe('hLock#reset', function () {

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

  it('should change the secret of the lock', function (done) {

    var promise = ASSETS.hl.reset(ASSETS.lockId1, 'another-secret');

    promise.should.be.instanceof(Promise);

    promise.then((result) => {

        // make sure the unlock function returns undefined.
        // if unlocking fails, it will fail the promise itself
        should(result).be.undefined();

        // check that the lock's secret has been changed
        return ASSETS.hl.unlock(ASSETS.lockId1, 'another-secret', 'attempter-id');
      })
      .then(() => {
        done();
      })
      .catch(done);
  });

  it('should fail to change the secret of a lock that does not exist', function (done) {

    var promise = ASSETS.hl.reset(new ObjectId().toString(), 'another-secret');

    promise.should.be.instanceof(Promise);

    promise.then(() => {
        done(new Error('expected error'));
      }, (err) => {

        err.should.be.instanceof(hLock.errors.InexistentLock);

        done();
      })
      .catch(done);
  });

  it('should fail if no lockId is passed', function (done) {

    var promise = ASSETS.hl.reset(undefined, 'another-secret');

    promise.should.be.instanceof(Promise);

    promise.then(() => {
        done(new Error('expected error'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidLockId);
        err.name.should.equal('InvalidLockId');

        done();
      })
      .catch(done);
  });

  it('should fail if no secret is passed', function (done) {

    var promise = ASSETS.hl.reset(ASSETS.lockId1, undefined);
    promise.should.be.instanceof(Promise);

    promise.then(() => {
        done(new Error('expected error'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidLockSecret);
        err.name.should.equal('InvalidLockSecret');

        done();
      })
      .catch(done);
  });
});