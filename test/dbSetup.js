const { assert } = require('egg-mock/bootstrap')
const shortid = require('shortid')

async function mysqlSetup({ model, service }) {
  const phone = '13988888888'
  const phone2 = '18588888888'

  const user = await service.user.newUser({ phone, password: phone, username: shortid() })
  const user2 = await service.user.newUser({ phone: phone2, password: phone2, username: shortid() })

  assert(user.phone === phone)
  assert(user2.phone === phone2)

  // console.log('mysqlSetup')

  return {
    user,
    user2,
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
