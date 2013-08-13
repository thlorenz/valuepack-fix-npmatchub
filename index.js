'use strict';
var repos = require('npmatchub').repos
  , leveldb =  require('valuepack-core/mine/leveldb')
  , getNpmPackages = require('./lib/get-npm-packages');

// Test
if (!module.parent) {
  leveldb.open(function (err, db) {
    if (err) return console.error(err);
    getNpmPackages(db, 'substack', function (packages) {

      var opts = { packages: packages, trust: true };
      repos(opts, function (err, repos) {
        if (err) return console.error(err);
        console.error('Results');
      })
      .on('processing', function (pack) {
        process.stderr.write('.');
      })
      .on('processed', function (pack, github) {
        if (github) console.error('%s: \t%s/%s', pack.name, github.login, github.repo);
        else console.error('%s: \tNOT FOUND', pack.name);
      });

    });
  });
}
