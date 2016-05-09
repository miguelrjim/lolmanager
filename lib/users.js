var https = require('https');
var configuration = require('./configuration');
var utilities = require('./utilities');
var usersByName = {};
var usersById = {};

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
          user.login = {
            username: username,
            password: password
          }
          getCurrentGame(user.id, region)
            .then(() => getLeagues(user.id, region))
            .then(() => resolve(user));
        }, reason => {
          reject(reason);
          delete usersByName[name];
        })
    }
  })
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

function getCurrentGame(id, region) {
  return new Promise((resolve, reject) => {
    "use strict";
    let req = https.request({
      hostname: utilities.buildHostname(region),
      path: utilities.buildUrl(utilities.TYPES.currentGame, region, id)
    }, res => {
      "use strict";
      let data = '';
      res.setEncoding('utf8');
      res.on('data', d => data += d);
      res.on('end', () => {
        let user = usersById[id];
        user.inGame = res.statusCode < 400;
        user.inGameTimestamp = Date.now();
        resolve(user);
      })
    })
    req.end();
  })
}

module.exports = {
  add: add,
  getAll: getAll,
  getCurrentGame: getCurrentGame
}