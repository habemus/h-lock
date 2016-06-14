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
 * When lockId is Invalid
 * @param {String} message
 */
function InvalidLockId(message) {
  HLockError.call(this, message);
}
util.inherits(InvalidLockId, HLockError);
InvalidLockId.prototype.name = 'InvalidLockId';

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

function InexistentLock(message) {
  HLockError.call(this, message);
}
util.inherits(InexistentLock, HLockError);
InexistentLock.prototype.name = 'InexistentLock';

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
exports.InvalidLockId = InvalidLockId;
exports.InvalidLockSecret = InvalidLockSecret;
exports.InvalidAttempterId = InvalidAttempterId;
exports.InvalidSecret = InvalidSecret;
exports.InexistentLock = InexistentLock;
exports.LockTemporarilyDisabled = LockTemporarilyDisabled;
exports.LockPermanentlyDisabled = LockPermanentlyDisabled;