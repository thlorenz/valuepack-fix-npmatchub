'use strict';

var npmatchub = require('npmatchub');
var getNpmPackages = require('./get-npm-packages');
var log = require('valuepack-core/util/log');

/**
 * Matches up npm user to a github login and his packages to github repositories
 * 
 * @name exports
 * @function
 * @param db {LevelDb} mining db
 * @param npmuser {String} npm user name
 * @param cb {Function} called back with an error or result with following properties:
 *  - login: github login that appeared most often for the given packages
 *  - repos: key/values - key: package-name value: repoUrl
 *  - packs: the npm packages with the repoUrl filled in where it was missing
 */
var go = module.exports = function (db, npmuser, cb) {

  getNpmPackages(db, npmuser, function (packages) {

    var logins = npmatchub.logins(packages);

    // github login that was found most often is first, so we'll use that even if multiple logins were found
    var login = logins.length && logins[0].login;
    log.silly('matchub', 'login', login);

    var opts = { packages: packages, logins: logins, trust: true };
    npmatchub.repos(opts, function (err, packs) {
      if (err) return cb(err); 

      var repos = packs
        .reduce(function (acc, pack) {
          acc[pack.name] = pack.repoUrl;
          return acc;
        }, {});

      cb(null, { login: login, repos: repos, packs: packs });
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
    go(db, 'thlorenz', function () {});
  });
}
