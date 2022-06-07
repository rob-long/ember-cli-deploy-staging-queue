'use strict';
var BasePlugin = require('ember-cli-deploy-plugin');
const axios = require('axios');

const checkStagingQueue = (context) => {
  const deployTarget = context.commandOptions.deployTarget;
  const isStaging = deployTarget === 'staging';
  const isProduction = deployTarget === 'production';

  return new Promise(function (resolve, reject) {
    const url = 'https://later-slack.herokuapp.com/staging';

    if (context && context.commandOptions && context.commandOptions.force) {
      resolve();
    }

    if (isStaging || isProduction) {
      axios
        .get(url)
        .then((response) => {
          if (response.data && response.data.queue.length) {
            const { username } = response.data.queue[0];
            reject(`Staging has been taken over by ${username}`);
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
  name: '@latermedia/ember-cli-deploy-later',

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
