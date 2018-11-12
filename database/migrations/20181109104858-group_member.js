'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    await queryInterface.createTable('group_members', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      group_id: Sequelize.INTEGER,
      user_id: Sequelize.INTEGER,
      join_date: {
        type: Sequelize.DATE,
        defaultValue: Date.now,
      },
      color: {
        type: Sequelize.STRING(10),
      },
      mute: {
        type: Sequelize.STRING(5),
        defaultValue: '1',
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    })

    await queryInterface.createTable('group_invites', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      group_id: Sequelize.INTEGER,
      invite_user: Sequelize.INTEGER,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    })

    await queryInterface.addColumn('groups', 'created_at', {
      type: Sequelize.DATE,
    })
    await queryInterface.addColumn('groups', 'updated_at', {
      type: Sequelize.DATE,
    })
    await queryInterface.addColumn('groups', 'can_delete', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    })
    await queryInterface.addColumn('groups', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    })
    await queryInterface.removeColumn('groups', 'uid')
    await queryInterface.removeColumn('groups', 'group_color')
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  },
}
