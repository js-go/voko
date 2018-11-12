'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const TodoItem = app.model.define('todo_item', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    tid: STRING(20),
    content: STRING(255),
    type: INTEGER,
    sms_number: STRING(30),
    sms_msg: STRING(255),
    phone: STRING(255),
    map: STRING(255),
    photo: STRING(255),
    trip: STRING(255),
  }, {
    timestamps: false,
  });

  return TodoItem;
};
