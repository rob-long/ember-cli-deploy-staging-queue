'use strict';
var BasePlugin = require('ember-cli-deploy-plugin');
const axios = require('axios');

const checkStagingQueue = (context) => {
  const deployTarget = context.commandOptions?.deployTarget;
  const isStaging = deployTarget === 'staging';
  const isProduction = deployTarget === 'production';

  return new Promise(function (resolve, reject) {
    const url = `http://localhost:8080/staging`;

    if (context.commandOptions.force) {
      resolve();
    }

    if (isStaging || isProduction) {
      axios
        .get(url)
        .then((response) => {
          if (response.data.queue?.length) {
            reject(`Staging has been taken over by ${response.data.queue[0]}`);
          } else {
            resolve();
          }
        })
        .catch((error) => {
          reject(`Error getting staging status: ${error}`);
        });
      return;
    }

    resolve();
  });
};

module.exports = {
  name: 'ember-cli-deploy-later',

  createDeployPlugin: function (options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      willBuild: checkStagingQueue,
      willUpload: checkStagingQueue,
      willActivate: checkStagingQueue,
    });

    return new DeployPlugin();
  },
};
