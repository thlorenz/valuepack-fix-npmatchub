'use strict';

var npm     =  require('valuepack-core/mine/namespaces').npm
  , leveldb =  require('valuepack-core/mine/leveldb')
  , collect =  require('concat-stream')
  , through =  require('through');

/**
 * Gets all npm packages for the given user from the db from the 'byOwner' index.
 *
 * @name exports
 * @function
 * @param db {LevelDB} root
 * @param npmUserName {String}
 * @param cb {Function} invoked with an array of metadata of all npm packages of the user
 */
var go = module.exports = function (db, npmUserName, cb) {
  var packages =  db.sublevel(npm.packages, { valueEncoding: 'json' })
    , byOwner  =  db.sublevel(npm.byOwner, { valueEncoding: 'utf8' });

  function readPackage(key, cb) {

    // handle the case that a user may commit to mutliple repos, so we need to do this even for users that supply
    // their github handle in order to find all possible repos
    // We'll need that to try to find repos without supplied url in possibly different locations

    packages.get(key, function (err, pack) {
      if (err) return this.queue(null, err);
      this.queue(pack);
    }.bind(this));
  }

  byOwner
    .createValueStream({ start: npmUserName, end: npmUserName + '\xff\xff' })
    .pipe(through(readPackage))
    .pipe(collect(cb));
};

// Test
if (!module.parent) {
  leveldb.open(function (err, db) {
    if (err) return console.error(err);

    go(db, 'tjholowaychuk', function (data) {
      console.log(data);
    });
  });
}
