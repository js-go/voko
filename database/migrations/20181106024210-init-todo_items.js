'use strict';

module.exports = {
  up: async(queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    const { INTEGER, STRING } = Sequelize;
    await queryInterface.createTable('todo_items', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      tid: STRING(20),
      content: STRING(255),
      type: INTEGER,
      sms_number: STRING(30),
      sms_msg: STRING(255),
      phone: STRING(255),
      map: STRING(255),
      photo: STRING(255),
      trip: STRING(255)
    });
  },

  down: async(queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.dropTable('todo_items');
  }
};
