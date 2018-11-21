const { assert } = require('egg-mock/bootstrap')

async function mysqlSetup({ model, service }) {
  const now = Date.now()
  const phone = '13988888888'
  const username = now + phone

  const user = await service.user.newUser({ phone, password: phone, username })

  assert(user.phone === phone)
  assert(user.username === username)

  // console.log('mysqlSetup')

  return {
    user,
  }
}

async function mysqlCleanUp({ model }) {
  // clear all user
  await model.User.truncate()

  // clear all group data
  await model.Group.truncate()

  // clear all group member
  await model.GroupMember.truncate()

  // console.log('mysqlCleanUp')
}

exports.mysqlCleanUp = mysqlCleanUp
exports.mysqlSetup = mysqlSetup
