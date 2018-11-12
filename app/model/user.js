'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE, BOOLEAN } = app.Sequelize;

  const User = app.model.define('user', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    username: STRING(30),
    password: STRING(100),
    phone: STRING(30),
    is_online: {
      type: BOOLEAN,
      defaultValue: false,
    },
    created_at: DATE,
    updated_at: DATE,
  });

  return User;
};
