'use strict';

// had enabled by egg
// exports.static = true;
exports.sequelize = {
  enable: true,
  package: 'egg-sequelize'
};

// exports.redis = {
//   enable: true,
//   package: 'egg-redis',
// };

exports.passport = {
  enable: true,
  package: 'egg-passport',
};

exports.passportLocal = {
  enable: true,
  package: 'egg-passport-local',
};

exports.jwt = {
  enable: true,
  package: "egg-jwt"
};