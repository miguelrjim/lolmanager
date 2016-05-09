"use strict";
const fs = require('fs');
const path = require('path');

function Configuration() {

}

Configuration.prototype.load = function () {
  return new Promise((resolve, reject) => {
    let confPath = path.join(__dirname, '..', 'configuration.json');
    fs.exists(confPath, exists => {
      if(!exists) {
        resolve();
      }
      else {
        fs.readFile(confPath, (err, data) => {
          let conf = JSON.parse(data.toString());
          Object.keys(conf)
            .forEach(property => {
              this[property] = conf[property];
            }, this);
          resolve();
        })
      }
    })
  })
};

Configuration.prototype.save = function (newConfiguration) {
  return new Promise((resolve, reject) => {
    this.deleteConf.call(this);
    Object.keys(newConfiguration)
      .forEach(property => {
        this[property] = newConfiguration[property];
      }, this)
    fs.writeFile(path.join(__dirname, 'configuration.json'), JSON.stringify(this), resolve);
  });
};

Configuration.prototype.reload = function () {
  this.deleteConf();
  return this.load();
};

Configuration.prototype.deleteConf = function() {
  Object.keys(this)
    .forEach(property => {
      delete this[property];
    }, this);
}

module.exports = new Configuration();