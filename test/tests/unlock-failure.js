const assert = require('assert');

// third-party dependencies
const should = require('should');
const debug = require('debug')('h-lock-unlock-failure');

// lib
const hLock = require('../../lib');

// auxiliary
const aux    = require('../auxiliary');

/**
 * Auxiliary function 
 * @param  {Number} ms
 * @return {Promise}
 */
function _wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

describe('hLock#unlock failure tracking', function () {

  var ASSETS = {};

  beforeEach(function (done) {

    aux.setup()
      .then((assets) => {
        ASSETS = assets;

        ASSETS.hl = hLock({
          mongooseConnection: ASSETS.mongooseConnection,
          lockModelName: 'TestLock',

          unlockFailureCountMode: 'BY_LOCK',
          // make the failure expire in 4 seconds
          // this is a very silly timeout
          unlockFailureCooldown: 4,
          unlockFailureCooldownCount: 2,
          maxUnlockFailures: 3,
        });

        // create one lock
        return ASSETS.hl.create('lock-1', 'secret-1');
      })
      .then(() => {
        // ok
        done();
      })
      .catch(done);
  });

  afterEach(function (done) {
    aux.teardown().then(() => { done(); });
  });

  it('should enforce unlockFailureCooldownCount by counting unlock attempts per lock per attempter', function (done) {
    var hl = ASSETS.hl;
    var attempterId = 'some-id';

    function errorExpected() {
      done(new Error('error expected'));
    }

    hl.unlock('lock-1', 'wrong-password', attempterId)
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidSecret);

        return hl.unlock('lock-1', 'wrong-password', attempterId);
      })
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidSecret);

        return hl.unlock('lock-1', 'wrong-password', attempterId);
      })
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.LockTemporarilyDisabled);
        err.reason.should.equal('MaxFailedUnlockAttemptsReached');

        // should be temporarily disabled
        // even if secret is correct
        return hl.unlock('lock-1', 'secret-1', attempterId);
      })
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.LockTemporarilyDisabled);
        err.reason.should.equal('MaxFailedUnlockAttemptsReached');

        done();
      })
      .catch(done);
  });

  it('should count only attempts on the same lock by the same attempter', function (done) {
    var hl = ASSETS.hl;
    var attempter1 = 'one';
    var attempter2 = 'two';

    function errorExpected() {
      done(new Error('error expected'));
    }

    // attempter1 1st attempt
    hl.unlock('lock-1', 'wrong-password', attempter1)
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidSecret);

        // attempter2 1st attempt
        return hl.unlock('lock-1', 'wrong-password', attempter2);
      })
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidSecret);

        // attempter2 2nd attempt
        return hl.unlock('lock-1', 'wrong-password', attempter2);
      })
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidSecret);

        // attempter1 2nd attempt (should be successful)
        return hl.unlock('lock-1', 'secret-1', attempter1);
      })
      .then(() => {

        // success
        
        // attempter2 3rd attempt with correct credentials
        // but should fail due to cooldown
        return hl.unlock('lock-1', 'secret-1', attempter2);
      })
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.LockTemporarilyDisabled);
        err.reason.should.equal('MaxFailedUnlockAttemptsReached');

        done();
      })
      .catch(done);
  });

  it('should permanently disable the lock if maxUnlockFailures is exceeded', function (done) {

    this.timeout(7000);

    var hl = ASSETS.hl;
    var attempterId = 'some-id';

    function errorExpected() {
      done(new Error('error expected'));
    }

    // 1st failure
    hl.unlock('lock-1', 'wrong-password', attempterId)
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidSecret);

        // 2nd consecutive failure
        return hl.unlock('lock-1', 'wrong-password', attempterId);
      })
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidSecret);

        // wait 4 seconds for the 1st and 2nd failues to expire (COOLDOWN)
        return _wait(4000);
      })
      .then(() => {

        // 3rd consecutive failure
        return hl.unlock('lock-1', 'wrong-password', attempterId);
      })
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidSecret);

        // 4th attempt after 3 consecutive failures should return permanently disable
        // even with the correct secret
        return hl.unlock('lock-1', 'secret-1', attempterId);
      })
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.LockPermanentlyDisabled);
        err.reason.should.equal('MaxFailedUnlockAttemptsReached');

        done();
      })
      .catch(done);
  });

  it('should clear failures once lock is successfully unlocked', function (done) {

    this.timeout(9000);

    var hl = ASSETS.hl;
    var attempterId = 'some-id';

    function errorExpected() {
      done(new Error('error expected'));
    }

    // 1st failure
    hl.unlock('lock-1', 'wrong-password', attempterId)
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidSecret);

        // 2nd consecutive failure
        return hl.unlock('lock-1', 'wrong-password', attempterId);
      })
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.InvalidSecret);

        // Temporary disable
        return hl.unlock('lock-1', 'secret-1', attempterId);
      })
      .then(errorExpected, (err) => {
        err.should.be.instanceof(hLock.errors.LockTemporarilyDisabled);
        err.reason.should.equal('MaxFailedUnlockAttemptsReached');
        debug('wait 4s');

        // wait for COOLDOWN
        return _wait(4000);
      })
      .then(() => {
        // successful unlock
        return hl.unlock('lock-1', 'secret-1', attempterId);
      })
      .then(() => {

        // failure count should restart

        // 1st failure
        return hl.unlock('lock-1', 'wrong-password', attempterId);

      })
      .then(errorExpected, (err) => {

        debug(err.name);

        // process should be restarted
        err.should.be.instanceof(hLock.errors.InvalidSecret);

        // 2nd failure
        return hl.unlock('lock-1', 'wrong-password', attempterId);
      })
      .then(errorExpected, (err) => {

        debug(err.name);

        err.should.be.instanceof(hLock.errors.InvalidSecret);

        debug('wait 4s');
        // wait for COOLDOWN
        return _wait(4000);
      })
      .then(() => {
        // 3rd failure
        return hl.unlock('lock-1', 'wrong-password', attempterId);
      })
      .then(errorExpected, (err) => {
        debug(err.name);

        err.should.be.instanceof(hLock.errors.InvalidSecret);

        // 4th attempt after 3 consecutive failures should return permanently disable
        // even with the correct secret
        return hl.unlock('lock-1', 'secret-1', attempterId);
      })
      .then(errorExpected, (err) => {
        debug(err.name);
        err.should.be.instanceof(hLock.errors.LockPermanentlyDisabled);

        done();
      })
      .catch(done);
  });


});