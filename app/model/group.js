'use strict';

module.exports = app => {
  const { STRING, INTEGER} = app.Sequelize;

  const Group = app.model.define('group', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    uid: STRING(20),
    group_name: STRING(30),
    group_color: STRING(30),
    group_owner_id: STRING(20)
  });

  return Group;
};