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
    await queryInterface.createTable('groups', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      uid: STRING(20),
      group_name: STRING(30),
      group_color: STRING(30),
      group_owner_id: STRING(20)
    });
  },

  down: async(queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.dropTable('groups');
  }
};
