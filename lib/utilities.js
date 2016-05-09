/**
 * Created by migue on 5/7/2016.
 */
var configuration = require('./configuration');

const REGION_MAPPING = {
  "br": "br1",
  "eune": "eun1",
  "euw": "euw1",
  "jp": "jp1",
  "kr": "kr",
  "lan": "la1",
  "las": "la2",
  "na": "na1",
  "oce": "oc1",
  "ru": "pbe1",
  "tr": "ru"
}

const TYPES = {
  summonerByName:  {
    first: '/v1.4/summoner/by-name/'
  },
  leaguesById: {
    first: '/v2.5/league/by-summoner/',
    second: '/entry'
  },
  currentGame: {
    observer: true,
    first: '/observer-mode/rest/consumer/getSpectatorGameInfo/'
  }
}

function buildHostname(region) {
  return region + '.api.pvp.net';
}

function buildUrl(type, region, parameter) {
  "use strict";
  let url;
  if(type.observer) {
    url = type.currentGame + REGION_MAPPING[region] + parameter
  }
  else {
    url = '/api/lol/' + region + type.first + encodeURIComponent(parameter) + (type.second || '');
  }
  return url + '?api_key=' + (configuration.secret || process.env.SECRET_KEY)
}

module.exports = {
  TYPES: TYPES,
  buildUrl: buildUrl,
  buildHostname: buildHostname
}