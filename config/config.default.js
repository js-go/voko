'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1541123489941_1931';

  // add your config here
  config.middleware = [];

  config.sequelize = {
    dialect: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: "root",
    password: "root",
    database: 'voko_default',
    operatorsAliases: false,
  };

  exports.jwt = {
    secret: "nodejsisawsome"
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  return config;
};
