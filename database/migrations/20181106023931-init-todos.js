'use strict';

module.exports = {
  up: async(queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    const { INTEGER, DATE, STRING, BOOLEAN } = Sequelize;
    await queryInterface.createTable('todos', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      uid: STRING(20),
      name: STRING(255),
      exp_date: DATE,
      is_done: BOOLEAN,
      created_at: DATE,
      updated_at: DATE
    });
  },

  down: async(queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.dropTable('todos');
  }
};
