const { app, assert } = require('egg-mock/bootstrap')
const R = require('ramda')
const { mysqlCleanUp, mysqlSetup } = require('../../dbSetup')

describe('test/app/service/group.test.js', () => {
  let ctx
  let testData

  before(async () => {
    ctx = app.mockContext()
  })

  beforeEach(async () => {
    this.testData = testData = await mysqlSetup(ctx)
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
    const newGroupPayload = {
      group_name: Date.now() + '_newGroup',
      owner: this.testData.user.id,
    }

    const newGroupPayload2 = {
      group_name: Date.now() + '_newGroup',
      owner: this.testData.user2.id,
    }

    const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

    assert.ok(newGroupId)

    const newGroupId2 = await ctx.service.group.newGroup(newGroupPayload2)
    assert.ok(newGroupId2)

    const groupList = await ctx.service.group.myGroupList(this.testData.user.id)

    assert(groupList.length > 0)
    // 新用户默认会有一个 group
    assert(groupList.length === 2)

    const groupList2 = await ctx.service.group.myGroupList(this.testData.user2.id)

    assert(groupList2.length > 0)
    // 新用户默认会有一个 group
    assert(groupList2.length === 2)
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

      await ctx.service.group.remove({ group_id: newGroupId, user_id: this.testData.user.id })

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
  describe('invite group', () => {
    it('invite lists', async () => {
      const { user, user2 } = testData

      const invites = await ctx.service.group.invites(user.id)

      assert(invites.length === 0)

      const newGroupPayload = {
        group_name: Date.now() + '_newGroup',
        owner: user2.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      const newInvite = await ctx.service.group.inviteUserInGroup({
        group_id: newGroupId,
        user_id: user.id,
        current_user: user2,
      })

      assert(newInvite.id)

      const invites2 = await ctx.service.group.invites(user.id)

      assert(invites2.length === 1)
      assert(invites2[0].group_id === newGroupId)
      assert(invites2[0].invite_user === user.id)
    })

    it('invite user', async () => {
      const { user, user2 } = this.testData
      const newGroupPayload = {
        group_name: Date.now() + '_newGroup',
        owner: user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      await ctx.service.group.inviteUserInGroup({
        group_id: newGroupId,
        user_id: user2.id,
        current_user: user,
      })

      const invites = await ctx.service.group.invites(user2.id)

      assert(invites.length > 0)
      assert(invites.length === 1)

      const invite = invites[0]

      assert(invite)
      assert(invite.group_id === newGroupId)
      assert(invite.invite_user === user2.id)
    })

    it('invite self', async () => {
      const { user } = this.testData
      const newGroupPayload = {
        group_name: Date.now() + '_newGroup',
        owner: user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      try {
        await ctx.service.group.inviteUserInGroup({
          group_id: newGroupId,
          user_id: user.id,
          current_user: user,
        })
      } catch (err) {
        assert.throws(
          () => {
            throw err
          },
          {
            message: "You can't invite yourself",
          }
        )
      }
    })

    it('invite group not found', async () => {
      const { user, user2 } = this.testData
      const randomId = Math.floor(Math.random() * 10000)

      try {
        await ctx.service.group.inviteUserInGroup({
          group_id: randomId,
          user_id: user2.id,
          current_user: user,
        })
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

    it('invite permissions error', async () => {
      const { user, user2 } = this.testData
      const newGroupPayload = {
        group_name: Date.now() + '_newGroup',
        owner: user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      try {
        await ctx.service.group.inviteUserInGroup({
          group_id: newGroupId,
          user_id: user.id,
          current_user: user2,
        })
      } catch (err) {
        assert.throws(
          () => {
            throw err
          },
          {
            message: '只能创建者邀请加入',
          }
        )
      }
    })

    it('reject invite', async () => {
      const { user, user2 } = this.testData
      const newGroupPayload = {
        group_name: Date.now() + '_newGroup',
        owner: user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      await ctx.service.group.inviteUserInGroup({
        group_id: newGroupId,
        user_id: user2.id,
        current_user: user,
      })

      const invites = await ctx.service.group.invites(user2.id)

      assert(invites.length > 0)
      assert(invites.length === 1)

      const invite = invites[0]

      assert(invite)
      assert(invite.group_id === newGroupId)
      assert(invite.invite_user === user2.id)

      await ctx.service.group.acceptGroupInvite({ inviteId: invite.id, currentUser: user2, accept: false })

      const invites2 = await ctx.service.group.invites(user2.id)

      assert(invites2.length === 0)
    })

    it('accept invite', async () => {
      const { user, user2 } = this.testData
      const newGroupPayload = {
        group_name: Date.now() + '_newGroup',
        owner: user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      await ctx.service.group.inviteUserInGroup({
        group_id: newGroupId,
        user_id: user2.id,
        current_user: user,
      })

      const invites = await ctx.service.group.invites(user2.id)

      assert(invites.length > 0)
      assert(invites.length === 1)

      const invite = invites[0]

      assert(invite)
      assert(invite.group_id === newGroupId)
      assert(invite.invite_user === user2.id)

      await ctx.service.group.acceptGroupInvite({ inviteId: invite.id, currentUser: user2, accept: true })

      const invites2 = await ctx.service.group.invites(user2.id)

      assert(invites2.length === 0)

      const user2GroupList = await ctx.service.group.myGroupList(user2.id)

      assert(user2GroupList.length === 2)
    })

    it('user exist', async () => {
      const { user, user2 } = testData

      const newGroupPayload = {
        group_name: Date.now() + '_newGroup',
        owner: user2.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      const newInvite = await ctx.service.group.inviteUserInGroup({
        group_id: newGroupId,
        user_id: user.id,
        current_user: user2,
      })

      assert(newInvite.id)

      const invites2 = await ctx.service.group.invites(user.id)

      assert(invites2.length === 1)

      await ctx.service.group.acceptGroupInvite({
        inviteId: newInvite.id,
        currentUser: user,
        accept: true,
      })

      // invite again
      const newInvite2 = await ctx.service.group.inviteUserInGroup({
        group_id: newGroupId,
        user_id: user.id,
        current_user: user2,
      })

      assert(newInvite2.id !== newInvite.id)

      try {
        await ctx.service.group.acceptGroupInvite({
          inviteId: newInvite2.id,
          currentUser: user,
          accept: true,
        })
      } catch (err) {
        assert.throws(
          () => {
            throw err
          },
          {
            message: 'user exist',
          }
        )
      }
    })

    it('invite not found', async () => {
      const { user } = testData
      const randomId = Math.floor(Math.random() * 10000)

      try {
        await ctx.service.group.acceptGroupInvite({
          inviteId: randomId,
          currentUser: user,
        })
      } catch (err) {
        assert.throws(
          () => {
            throw err
          },
          {
            message: 'invite not found',
          }
        )
      }
    })

    it('invite user error', async () => {
      const { user, user2 } = this.testData
      const newGroupPayload = {
        group_name: Date.now() + '_newGroup',
        owner: user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      await ctx.service.group.inviteUserInGroup({
        group_id: newGroupId,
        user_id: user2.id,
        current_user: user,
      })

      const invites = await ctx.service.group.invites(user2.id)

      assert(invites.length === 1)

      const firstInvite = invites[0]

      try {
        await ctx.service.group.acceptGroupInvite({ inviteId: firstInvite.id, currentUser: user, accept: true })
      } catch (err) {
        assert.throws(
          () => {
            throw err
          },
          {
            message: 'invite user error',
          }
        )
      }
    })
  })
})
