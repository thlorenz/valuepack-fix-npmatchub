'use strict';

var npmatchub      =  require('npmatchub')
  , getNpmPackages =  require('./get-npm-packages')
  , log            =  require('valuepack-core/util/log')
  , map            =  require('valuepack-core/mine/namespaces').map
  ;

function getResolve(mapRepos) {
  return function resolve (pack, logins, trust, cb) {
    mapRepos.get(pack.name, function (err, entry) {
      // if we already found this package before, we save us the trouble of finding it again
      if (!err) return cb(null, entry);

      log.silly('matchub', '%s not found in db, looking it up', pack.name);

      // otherwise try to find it via the npmatchub algorithm
      npmatchub.resolve(pack, logins, trust, cb);
    });
  }
}

function storeMaps (mapRepos, packs, cb) {
  var batch = packs.map(function (pack) {
    return { key: pack.name, value: pack.repoUrl, type: 'put' };
  });

  mapRepos.batch(batch, cb);
}

/**
 * Matches up npm user to a github login and his packages to github repositories
 * 
 * @name exports
 * @function
 * @param db {LevelDb} mining db
 * @param npmuser {String} npm user name
 * @param npmuser {String} github login, null if it was not supplied by the user 
 * @param cb {Function} called back with an error or npm packages whose repoUrl was filled in where ever possible
 * */
var go = module.exports = function (db, npmuser, login, cb) {
  var mapRepos = db.sublevel(map.repos);

  getNpmPackages(db, npmuser, function (packages) {

    var logins = npmatchub.logins(packages);

    // github login that was found most often is first, so we'll use that even if multiple logins were found
    login = login || logins.length && logins[0].login;
    log.silly('matchub', 'login', login);

    var opts = { 
        packages: packages
      , logins: logins
      , trust: true 
      , resolve: getResolve(mapRepos)
    };

    npmatchub.repos(opts, function (err, packs) {
      if (err) return cb(err); 

      storeMaps(mapRepos, packs, function (err) {
        if (err) log.error('matchub', err);  

        cb(null, packs);
      });
    })
    .on('processed', function (pack, github) {
      if (github) log.silly('matchub', 'matched %s: \t%s/%s', pack.name, github.login, github.repo);
      else log.silly('matchub', 'match for %s: \tNOT FOUND', pack.name);
    });
  });
};

if (!module.parent) {
  var leveldb =  require('valuepack-core/mine/leveldb')
  log.level = 'silly';
  leveldb.open(function (err, db) {
    if (err) return console.error(err);
    go(db, 'tjholowaychuk', null, function () {});

  });
}
