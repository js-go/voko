'use strict'

module.exports = ({ model, Sequelize }) => {
  const GroupMember = model.define('group_member', {
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

  return GroupMember
}
