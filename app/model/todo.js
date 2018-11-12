'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE, BOOLEAN } = app.Sequelize;

  const Todo = app.model.define('todo', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    uid: STRING(20),
    name: STRING(255),
    exp_date: DATE,
    is_done: BOOLEAN,
    created_at: DATE,
    updated_at: DATE,
  });

  return Todo;
};
