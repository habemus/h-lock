// native dependencies
const util = require('util');

/**
 * Base HLockError constructor
 * @param {String} message
 */
function HLockError(message) {
  Error.call(this);

  this.message = message;
}

util.inherits(HLockError, Error);

/**
 * When LockName is Invalid
 * @param {String} message
 */
function InvalidLockName(message) {
  HLockError.call(this, message);
}
util.inherits(InvalidLockName, HLockError);
InvalidLockName.prototype.name = 'InvalidLockName';

function NonUniqueLockName(message) {
  HLockError.call(this, message);
}
util.inherits(NonUniqueLockName, HLockError);
NonUniqueLockName.prototype.name = 'NonUniqueLockName';

function InvalidLockSecret(message) {
  HLockError.call(this, message);
}
util.inherits(InvalidLockSecret, HLockError);
InvalidLockSecret.prototype.name = 'InvalidLockSecret';

function InvalidAttempterId(message) {
  HLockError.call(this, message);
}
util.inherits(InvalidAttempterId, HLockError);
InvalidAttempterId.prototype.name = 'InvalidAttempterId';

function InvalidSecret(message) {
  HLockError.call(this, message);
}
util.inherits(InvalidSecret, HLockError);
InvalidSecret.prototype.name = 'InvalidSecret';

function InexistentLockName(message) {
  HLockError.call(this, message);
}
util.inherits(InexistentLockName, HLockError);
InexistentLockName.prototype.name = 'InexistentLockName';

function LockTemporarilyDisabled(reason, message) {
  HLockError.call(this, message);

  this.reason = reason;
}
util.inherits(LockTemporarilyDisabled, HLockError);
LockTemporarilyDisabled.prototype.name = 'LockTemporarilyDisabled';

function LockPermanentlyDisabled(reason, message) {
  HLockError.call(this, message);

  this.reason = reason;
}
util.inherits(LockPermanentlyDisabled, HLockError);
LockPermanentlyDisabled.prototype.name = 'LockPermanentlyDisabled';

// exports
exports.HLockError = HLockError;
exports.InvalidLockName = InvalidLockName;
exports.InvalidLockSecret = InvalidLockSecret;
exports.InvalidAttempterId = InvalidAttempterId;
exports.NonUniqueLockName = NonUniqueLockName;
exports.InvalidSecret = InvalidSecret;
exports.InexistentLockName = InexistentLockName;
exports.LockTemporarilyDisabled = LockTemporarilyDisabled;
exports.LockPermanentlyDisabled = LockPermanentlyDisabled;