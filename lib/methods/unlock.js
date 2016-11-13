// native dependencies

// third-party dependencies
const Bluebird = require('bluebird');
const debug = require('debug')('h-lock-unlock');
const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

module.exports = function (hLock, options) {
  // models
  const Lock          = hLock.models.Lock;
  const UnlockFailure = hLock.models.UnlockFailure;

  /**
   * Defines maximum number of unlock failures
   * before a lock is disabled
   * @type {Number}
   */
  const MAX_UNLOCK_FAILURES = options.maxUnlockFailures || 5;

  /**
   * Defines number of seconds for the unlockFailure be consirered cooled down
   * @type {Number | Seconds}
   */
  const UNLOCK_FAILURE_COOLDOWN = options.unlockFailureCooldown || 60;
  /**
   * Defines how many failures are tolerated before temporarily disabling the lock
   * @type {Number}
   */
  const UNLOCK_FAILURE_COOLDOWN_COUNT = options.unlockFailureCooldownCount || 3;

  /**
   * Auxiliary function that builds the failure query
   * @param  {String} absoluteOrPartial
   * @param  {String} lockId
   * @param  {String} attempterId
   * @return {Bluebird -> void}            
   */
  function _countFailures(kind, lockId, attempterId) {

    var query = {
      lockId: lockId,
      attempterId: attempterId,
      // count only failures that have not been cleared yet
      _cleared: false
    };

    if (kind === 'within_cooldown') {
      query.attemptedAt = {
        $gt: Date.now() - (UNLOCK_FAILURE_COOLDOWN * 1000)
      };
    }

    return Bluebird.resolve(UnlockFailure.count(query));
  }

  /**
   * Clears failures
   * @param  {String} lockId
   * @param  {String} attempterId
   * @return {Bluebird}
   */
  function _clearFailures(lockId, attempterId) {

    var query = {
      lockId: lockId,
      attempterId: attempterId,
      // update only failures that are not clear yet
      _cleared: false
    };

    var updateData = {
      _cleared: true
    };

    // update ALL documents matching the query
    var updateOptions = {
      multi: true
    }

    return Bluebird.resolve(UnlockFailure.update(query, updateData, updateOptions));
  }

  /**
   * unlock method
   * @param  {String} lockId   
   * @param  {String} secret 
   * @param  {String} attempterId
   * @return {Bluebird -> void}        
   */
  return function (lockId, secret, attempterId) {
    if (!ObjectId.isValid(lockId)) { return Bluebird.reject(new hLock.errors.InvalidLockId('lockId is required')); }
    if (typeof secret !== 'string') { return Bluebird.reject(new hLock.errors.InvalidLockSecret('lock secret is required for unlocking')); }
    if (typeof attempterId !== 'string') { return Bluebird.reject(new hLock.errors.InvalidAttempterId('attempterId is required for unlocking')); }

    return _countFailures('within_cooldown', lockId, attempterId)
      .then((partialUnlockFailures) => {

        if (partialUnlockFailures >= UNLOCK_FAILURE_COOLDOWN_COUNT) {
          return Bluebird.reject(new hLock.errors.LockTemporarilyDisabled('MaxFailedUnlockAttemptsReached'));
        }

      })
      .then(() => {
        // find the lock
        return Lock.findOne({ _id: lockId })
      })
      .then((lock) => {
        if (!lock) {
          return Bluebird.reject(new hLock.errors.InexistentLock('lock ' + lockId + ' does not exist'));
        }

        if (lock._status.value !== 'enabled') {
          // lock is permanently disabled
          return Bluebird.reject(new hLock.errors.LockPermanentlyDisabled(lock._status.reason));
        }

        return lock.validateSecret(secret);
      })
      .then((isValid) => {
        if (isValid) {

          // clear failed unlock attempts
          return _clearFailures(lockId, attempterId)
            .then(() => {
              return;
            });

        } else {

          // only register InvalidSecret errors
          var failure = new UnlockFailure({
            lockId: lockId,
            attempterId: attempterId,
          });

          return new Bluebird(function (resolve, reject) {

            function _reject() {
              reject(new hLock.errors.InvalidSecret('invalid secret'));
            }

            failure.save()
              .then(() => {
                return _countFailures('all', lockId, attempterId);
              })
              .then((totalUnlockFailures) => {

                debug('totalUnlockFailures', totalUnlockFailures);

                if (totalUnlockFailures >= MAX_UNLOCK_FAILURES) {
                  return hLock.disable(lockId, 'MaxFailedUnlockAttemptsReached');
                }
              })
              // always reject with the InvalidSecret error,
              // even if 
              //  - failure saving 
              //  - failure count or
              //  - lock disabling fails.
              .then(_reject, _reject);
          });

        }
      });
  };
};