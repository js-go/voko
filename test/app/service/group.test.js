const { app, assert } = require('egg-mock/bootstrap')
const R = require('ramda')
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

  it('group detail', async () => {
    const newGroupPayload = {
      group_name: Date.now() + '_newGroup',
      owner: this.testData.user.id,
    }

    const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

    assert.ok(newGroupId)

    const newGroup = await ctx.service.group.groupDetail(this.testData.user.id, newGroupId)

    assert(newGroup.id === newGroupId)
    assert(newGroup.group_name === newGroupPayload.group_name)
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

    const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

    assert.ok(newGroupId)
  })

  it('update group', async () => {
    const newGroupPayload = {
      group_name: Date.now() + '_newGroup',
      owner: this.testData.user.id,
      color: 'red',
      mute: '1',
    }

    const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

    assert.ok(newGroupId)

    const newName = Date.now() + '_update_newGroup'
    const newColor = 'blue'
    const newMute = '2'

    const updateGroup = await ctx.service.group.update({
      current_user: this.testData.user,
      group_id: newGroupId,
      name: newName,
      color: newColor,
      mute: newMute,
    })

    assert.ok(updateGroup)

    const newGroup = await ctx.service.group.groupDetail(this.testData.user.id, newGroupId)

    assert(newGroup.group_name === newName)
    assert(newGroup.color === newColor)
    assert(newGroup.mute === newMute)
  })

  describe('remove group', () => {
    it('remove owner group', async () => {
      const newGroupPayload = {
        group_name: Date.now() + '_newGroup',
        owner: this.testData.user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      const deleted = await ctx.service.group.remove({ group_id: newGroupId, user_id: this.testData.user.id })

      assert.ok(deleted)

      const findGroup = await ctx.service.group.groupDetail(this.testData.user.id, newGroupId)

      assert(findGroup.is_deleted === true)
    })

    // 使用 user 账号删除 user2 的 group
    it('remove other user group', async () => {
      const { user, user2 } = this.testData
      const groupList = await ctx.service.group.myGroupList(user2.id)

      assert(groupList.length > 0)

      const defaultGroup = R.find(R.propEq('group_owner_id', user2.id), groupList)

      try {
        await ctx.service.group.remove({ group_id: defaultGroup.id, user_id: user.id })
      } catch (err) {
        // 删除失败
        assert.throws(
          () => {
            throw err
          },
          {
            message: 'group not found',
          }
        )
      }
    })

    it('group not found', async () => {
      const randomId = Math.floor(Math.random() * 10000)

      try {
        await ctx.service.group.remove({ group_id: randomId, user_id: this.testData.user.id })
      } catch (err) {
        assert.throws(
          () => {
            throw err
          },
          {
            message: 'group not found',
          }
        )
      }
    })

    it('default group remove', async () => {
      // 找到自己的默认组
      const groupList = await ctx.service.group.myGroupList(this.testData.user.id)
      const defaultGroup = R.find(R.propEq('group_owner_id', this.testData.user.id), groupList)

      // 删除
      try {
        await ctx.service.group.remove({ group_id: defaultGroup.id, user_id: this.testData.user.id })
      } catch (err) {
        // 删除失败
        assert.throws(
          () => {
            throw err
          },
          {
            message: '不能删除默认组',
          }
        )
      }
    })
  })
})
