'use strict'

const { app, assert } = require('egg-mock/bootstrap')
const { mysqlCleanUp, mysqlSetup } = require('../../dbSetup')

describe('test/app/service/group.test.js', () => {
  let ctx

  before(async () => {
    ctx = app.mockContext()
  })

  beforeEach(async () => {
    this.testData = await mysqlSetup(ctx)
  })

  afterEach(async () => {
    await mysqlCleanUp(ctx)
  })

  it('my group list', async () => {
    const groupList = await ctx.service.group.myGroupList(this.testData.user.id)

    assert(groupList.length > 0)
    // 新用户默认会有一个 group
    assert(groupList.length === 1)
  })

  it('create a group', async () => {
    const newGroupPayload = {
      group_name: Date.now() + '_newGroup',
      owner: this.testData.user.id,
    }

    const newCreateGroup = await ctx.service.group.newGroup(newGroupPayload)

    // 匹配名字
    assert(newCreateGroup.group_name === newGroupPayload.group_name)
  })

  it('update group', async () => {
    const newGroupPayload = {
      group_name: Date.now() + '_newGroup',
      owner: this.testData.user.id,
      color: 'red',
    }

    const newCreateGroup = await ctx.service.group.newGroup(newGroupPayload)
    assert(newCreateGroup.group_name === newGroupPayload.group_name)
    // assert(newCreateGroup.color === newGroupPayload.color)

    const newName = Date.now() + '_update_newGroup'
    const newColor = 'blue'

    const updateGroup = await ctx.service.group.update({
      current_user: this.testData.user,
      group_id: newCreateGroup.id,
      name: newName,
      color: newColor,
    })

    assert(updateGroup === true)

    const newGroup = await ctx.service.group.groupDetail(newCreateGroup.id)

    assert(newGroup.group_name === newName)
    // TODO: color update
  })
})
