'use strict'

module.exports = ({ model, Sequelize }) => {
  const GroupInvite = model.define('group_invite', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    group_id: Sequelize.INTEGER,
    invite_user: Sequelize.INTEGER,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  })

  return GroupInvite
}
