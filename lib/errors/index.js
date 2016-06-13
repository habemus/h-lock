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
 * When LockName is missing
 * @param {String} message
 */
function MissingLockName(message) {
  HLockError.call(this, message);
}
util.inherits(MissingLockName, HLockError);
MissingLockName.prototype.name = 'MissingLockName';

function NonUniqueLockName(message) {
  HLockError.call(this, message);
}
util.inherits(NonUniqueLockName, HLockError);
NonUniqueLockName.prototype.name = 'NonUniqueLockName';

function MissingLockSecret(message) {
  HLockError.call(this, message);
}
util.inherits(MissingLockSecret, HLockError);
MissingLockSecret.prototype.name = 'MissingLockSecret';

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


// exports
exports.HLockError = HLockError;
exports.MissingLockName = MissingLockName;
exports.MissingLockSecret = MissingLockSecret;
exports.NonUniqueLockName = NonUniqueLockName;
exports.InvalidSecret = InvalidSecret;
exports.InexistentLockName = InexistentLockName;