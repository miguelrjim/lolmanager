const https = require('https');
const fs = require('fs');
const path = require('path');
const debug = require('debug')('lolmanager:users');
const configuration = require('./configuration');
const utilities = require('./utilities');
const usersByName = {};
const usersById = {};
const usersStorage = path.join(process.env.OPENSHIFT_DATA_DIR || path.join(__dirname, '..', 'tmp'), 'users.json');

function add(name, region, username, password) {
  return new Promise((resolve, reject) => {
    "use strict";
    let info = usersByName[name];
    if(info) {
      reject(info === true ? 'Fetching info' : 'Already registered');
    }
    else {
      usersByName[name] = true;
      getInfo(name, region)
        .then(user => {
          user = user[0];
          saveLogin(user.id, username, password);
          user.region = region;
          getCurrentGame(user.id)
            .then(() => getLeagues(user.id, region))
            .then(() => resolve(user));
        }, reason => {
          reject(reason);
          delete usersByName[name];
        })
    }
  })
}

function get(id) {
  return usersById[id];
}

function getAll() {
  return Object.keys(usersByName)
    .map(name => usersByName[name]);
}

function getInfo(names, region) {
  if(!(names instanceof Array)) {
    names = [names];
  }
  return new Promise((resolve, reject) => {
    "use strict";
    let req = https.request({
      hostname: utilities.buildHostname(region),
      path: utilities.buildUrl(utilities.TYPES.summonerByName, region, names.join(','))
    }, res => {
      "use strict";
      let data = '';
      res.setEncoding('utf8');
      res.on('data', d => data += d);
      res.on('end', () => {
        if(res.statusCode >= 400) {
          reject(`${res.statusCode}: ${data}`);
        }
        else {
          try {
            data = JSON.parse(data);
            let users = Object.keys(data).map(name => data[name]);
            users.forEach(user => {
              user = Object.assign({}, usersById[user.id] || {}, user);
              usersByName[user.name] = user;
              usersById[user.id] = user;
            });
            resolve(users);
          }
          catch (ex) {
            reject('Invalid response');
          }
        }
      })
    })
    req.end();
  })
}

function getLeagues(ids, region) {
  if(!(ids instanceof Array)) {
    ids = [ids];
  }
  if(!region && ids.length == 1) {
    region = usersById[ids[0]].region;
  }
  return new Promise((resolve, reject) => {
    "use strict";
    let req = https.request({
      hostname: utilities.buildHostname(region),
      path: utilities.buildUrl(utilities.TYPES.leaguesById, region, ids.join(','))
    }, res => {
      "use strict";
      let data = '';
      res.setEncoding('utf8');
      res.on('data', d => data += d);
      res.on('end', () => {
        if(res.statusCode >= 400) {
          reject(`${res.statusCode}: ${data}`);
        }
        else {
          try {
            data = JSON.parse(data);
            resolve(
              Object.keys(data)
                .map(id => {
                  let soloQueue = data[id].find(league => league.queue == "RANKED_SOLO_5x5");
                  let user = usersById[id];
                  if(soloQueue) {
                    user.ranking = {
                      tier: soloQueue.tier,
                      division: soloQueue.entries[0].division
                    }
                  }
                  return user;
                })
            );
          }
          catch (ex) {
            reject(`Invalid response: ${ex}`);
          }
        }
      })
    })
    req.end()
  })
}

function getCurrentGame(id) {
  return new Promise((resolve, reject) => {
    "use strict";
    let user = usersById[id];
    let req = https.request({
      hostname: utilities.buildHostname(user.region),
      path: utilities.buildUrl(utilities.TYPES.currentGame, user.region, user.id)
    }, res => {
      "use strict";
      let data = '';
      res.setEncoding('utf8');
      res.on('data', d => data += d);
      res.on('end', () => {
        user.inGame = res.statusCode < 400;
        user.inGameTimestamp = Date.now();
        resolve({
          inGame: user.inGame,
          inGameTimestamp: user.inGameTimestamp
        });
      })
    })
    req.end();
  })
}

function save() {
  return new Promise((resolve, reject) => {
    fs.writeFile(usersStorage, JSON.stringify(Object.keys(usersById).map(id => usersById[id])), resolve);
  });
}

function saveSync() {
  fs.writeFileSync(usersStorage, JSON.stringify(Object.keys(usersById).map(id => usersById[id])));
}

function load() {
  return new Promise((resolve, reject) => {
    fs.readFile(usersStorage, {
      encoding: 'utf8'
    }, (err, data) => {
      if(err) {
        resolve();
      }
      else {
        data = JSON.parse(data);
        data.forEach(user => {
          usersById[user.id] = user;
          usersByName[user.name] = user;
        });
        resolve();
      }
    })
  })
}

function saveLogin(id, username, password) {
  usersById[id].login = {
    username: username,
    password: password
  }
}

process.on('exit', () => saveSync());
process.on('SIGINT', process.exit);
process.on('SIGTERM', process.exit);

module.exports = {
  add: add,
  get: get,
  getAll: getAll,
  getCurrentGame: getCurrentGame,
  getInfo: getInfo,
  getLeagues: getLeagues,
  save: save,
  load: load,
  saveLogin: saveLogin
}