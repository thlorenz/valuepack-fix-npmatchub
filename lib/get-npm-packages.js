'use strict';

var npm     =  require('valuepack-core/mine/namespaces').npm
  , leveldb =  require('valuepack-core/mine/leveldb')
  , collect =  require('concat-stream');

var go = module.exports = function (db, npmUserName, cb) {
  var byOwner = db.sublevel(npm.byOwner, { valueEncoding: 'utf8' });
  return byOwner
    .createReadStream({ start: npmUserName, end: npmUserName + '\xff' })
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
