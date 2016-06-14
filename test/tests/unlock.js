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
    aux.teardown().then(() => { done(); });
  });

  it('should unlock if the secret is correct', function (done) {

    ASSETS.hl.unlock(ASSETS.lockId1, 'secret-1', 'attempter-id')
      .then((result) => {

        // make sure the unlock function returns undefined.
        // if unlocking fails, it will fail the promise itself
        should(result).be.undefined();

        done();
      })
      .catch(done);
  });

  it('should fail if secret is incorrect', function (done) {
    ASSETS.hl.unlock(ASSETS.lockId1, 'secret-2', 'attempter-id')
      .then(() => {
        done(new Error('expected error'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidSecret);
        err.name.should.equal('InvalidSecret');

        done();
      })
      .catch(done);
  });

  it('should fail if lock does not exist', function (done) {
    // 575f5ed506dffab02dbc249f is an id generated at mongodb shell
    // it probably does not exist as it shouldn't be reused by mongo
    ASSETS.hl.unlock('575f5ed506dffab02dbc249f', 'secret-2', 'attempter-id')
      .then(() => {
        done(new Error('expected error'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InexistentLock);
        err.name.should.equal('InexistentLock');

        done();
      })
      .catch(done);
  });

  it('should fail if no lockId is passed', function (done) {
    ASSETS.hl.unlock(undefined, 'secret-2', 'attempter-id')
      .then(() => {
        done(new Error('expected error'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidLockId);
        err.name.should.equal('InvalidLockId');

        done();
      })
      .catch(done);
  });

  it('should fail if no secret is passed', function (done) {
    ASSETS.hl.unlock(ASSETS.lockId1, undefined, 'attempter-id')
      .then(() => {
        done(new Error('expected error'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidLockSecret);
        err.name.should.equal('InvalidLockSecret');

        done();
      })
      .catch(done);
  });

  it('should fail if no attempter-id is passed', function (done) {
    ASSETS.hl.unlock(ASSETS.lockId1, 'secret-1', undefined)
      .then(() => {
        done(new Error('expected error'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidAttempterId);
        err.name.should.equal('InvalidAttempterId');

        done();
      })
      .catch(done);
  });
});