# valuepack-mine-npmatchub [![build status](https://secure.travis-ci.org/thlorenz/valuepack-mine-npmatchub.png)](http://travis-ci.org/thlorenz/valuepack-mine-npmatchub)

Fill in missing github related information during and after data mining


## Goal

Fits into the mining steps as follows:

1. mine npm users and packages
  - initially each user will have at most one github login (the one that is supplied)
2. deduce all user's github logins from the packages that supply a github repo url
3. collect github repository data for all github logins supplied for that user
  - since multiple npm users could use same gihub logins at time, check to not get this info twice
4. deduce missing package urls from npm packages, their names and the github logins of the user
  - to speed that up, we can just look up github repos that we already mined for each login instead of pinging github
    directly like npmatchub does by default
  - therefore we'll override `resolve`
5. at this point all data has been mined and missing pieces filled in

## Status

Nix, Nada, Nichevo, Nothing --> go away!

## Installation

    npm install valuepack-mine-npmatchub

## API


## License

MIT
