'use strict'

module.exports = ({ model, Sequelize }) => {
  const Group = model.define('group', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    group_name: Sequelize.STRING(30),
    group_owner_id: Sequelize.INTEGER,
    can_delete: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    is_deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  })

  Group.associate = function() {
    model.Group.hasMany(model.GroupMember)
  }

  return Group
}
