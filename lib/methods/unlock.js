// native dependencies

// third-party dependencies
const debug = require('debug')('h-lock-unlock');

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
   * @param  {String} lockName
   * @param  {String} attempterId
   * @return {Promise -> void}            
   */
  function _countFailures(kind, lockName, attempterId) {

    var query = {
      lockName: lockName,
      attempterId: attempterId,
      // count only failures that have not been cleared yet
      _cleared: false
    };

    if (kind === 'within_cooldown') {
      query.attemptedAt = {
        $gt: Date.now() - (UNLOCK_FAILURE_COOLDOWN * 1000)
      };
    }

    return UnlockFailure.count(query);
  }

  /**
   * Clears failures
   * @param  {String} lockName
   * @param  {String} attempterId
   * @return {Promise}
   */
  function _clearFailures(lockName, attempterId) {

    var query = {
      lockName: lockName,
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

    return UnlockFailure.update(query, updateData, updateOptions);
  }

  /**
   * unlock method
   * @param  {String} name   
   * @param  {String} secret 
   * @param  {String} attempterId
   * @return {Promise -> void}        
   */
  return function (lockName, secret, attempterId) {
    if (typeof lockName !== 'string') { return Promise.reject(new hLock.errors.InvalidLockName('lock name is required for unlocking')); }
    if (typeof secret !== 'string') { return Promise.reject(new hLock.errors.InvalidLockSecret('lock secret is required for unlocking')); }
    if (typeof attempterId !== 'string') { return Promise.reject(new hLock.errors.InvalidAttempterId('attempterId is required for unlocking')); }

    return _countFailures('within_cooldown', lockName, attempterId)
      .then((partialUnlockFailures) => {

        if (partialUnlockFailures >= UNLOCK_FAILURE_COOLDOWN_COUNT) {
          return Promise.reject(new hLock.errors.LockTemporarilyDisabled('MaxFailedUnlockAttemptsReached'));
        }

      })
      .then(() => {
        // find the lock
        return Lock.findOne({ name: lockName })
      })
      .then((lock) => {
        if (!lock) {
          return Promise.reject(new hLock.errors.InexistentLockName('lock ' + lockName + ' does not exist'));
        }

        if (lock._status.value !== 'enabled') {
          // lock is permanently disabled
          return Promise.reject(new hLock.errors.LockPermanentlyDisabled(lock._status.reason));
        }

        return lock.validateSecret(secret);
      })
      .then((isValid) => {
        if (isValid) {

          // // clear failed unlock attempts
          return _clearFailures(lockName, attempterId)
            .then(() => {
              return;
            });

        } else {

          function reject() {
            return Promise.reject(new hLock.errors.InvalidSecret('invalid secret'));
          }

          var failure = new UnlockFailure({
            lockName: lockName,
            attempterId: attempterId,
          });

          // only register InvalidSecret errors
          return failure.save()
            .then(() => {
              return _countFailures('all', lockName, attempterId);
            })
            .then((totalUnlockFailures) => {

              debug('totalUnlockFailures', totalUnlockFailures);

              if (totalUnlockFailures >= MAX_UNLOCK_FAILURES) {
                return hLock.disable(lockName, 'MaxFailedUnlockAttemptsReached');
              }
            })
            // always reject with the InvalidSecret error,
            // even if 
            //  - failure saving 
            //  - failure count or
            //  - lock disabling fails.
            .then(reject, reject);
        }
      });
  };
};