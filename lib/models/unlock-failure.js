// third-party
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// takes the connection and options and returns the model
module.exports = function (conn, hLock, options) {
  /**
   * The schema object for the failed unlock attempt
   * @type {Schema}
   */
  var unlockFailureSchema = new Schema({
    /**
     * Date the attempt was made.
     * @type {Date}
     */
    attemptedAt: {
      type: Date,
      default: Date.now,
      index: {
        // keep the failure in the database for at most one week 7 * 24 * 60 * 60
        expires: 7 * 24 * 60 * 60,
      }
    },

    /**
     * String that ideitifies the attempter
     * @type {String}
     */
    attempterId: {
      type: String,
      required: true,
    },

    /**
     * The lock's id
     * @type {String}
     */
    lockId: {
      type: String,
      required: true
    },

    /**
     * Property is set to true
     * once the unlock operation is successful
     * @type {Object}
     */
    _cleared: {
      type: Boolean,
      default: false
    }
  });

  var unlockFailureModelName = options.lockModelName + '_UnlockFailure';

  var UnlockFailure = conn.model(unlockFailureModelName, unlockFailureSchema);
  
  return UnlockFailure;
};