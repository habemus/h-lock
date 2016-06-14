const assert = require('assert');

// third-party dependencies
const should = require('should');

// lib
const hLock = require('../../lib');

// auxiliary
const aux    = require('../auxiliary');

describe('hLock#create', function () {

  var ASSETS;

  beforeEach(function (done) {
    aux.setup()
      .then((assets) => {
        ASSETS = assets;

        ASSETS.hl = hLock({
          mongooseConnection: ASSETS.mongooseConnection,
          lockModelName: 'TestLock',
        });

        done();
      });
  });

  afterEach(function (done) {
    aux.teardown().then(() => { done(); });
  });

  it('should require a lock secret', function (done) {

    ASSETS.hl.create(undefined, {})
      .then(() => {
        done(new Error('error expected'));
      }, (err) => {
        err.should.be.instanceof(hLock.errors.HLockError);
        err.should.be.instanceof(hLock.errors.InvalidLockSecret);
        err.name.should.equal('InvalidLockSecret');

        // make sure no db entry was created
        ASSETS.db.collection('testlocks').find().toArray((err, locks) => {
          if (err) { return done(err); }

          locks.length.should.equal(0);

          done();
        });

      })
      .catch(done);
  });

  it('should create a lock entry', function (done) {

    ASSETS.hl.create('my-secret', {})
      .then((lockId) => {

        lockId.should.be.a.String();

        return ASSETS.db.collection('testlocks').find().toArray();
      })
      .then((locks) => {
        locks.length.should.equal(1);

        done();
      })
      .catch((err) => {


        done(err);
      });
  });
});