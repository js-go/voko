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
    testData = testData = await mysqlSetup(ctx)
  })

  afterEach(async () => {
    await mysqlCleanUp(ctx)
  })

  it('group detail', async () => {
    const newGroupPayload = {
      groupName: Date.now() + '_newGroup',
      owner: testData.user.id,
    }

    const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

    assert.ok(newGroupId)

    const newGroup = await ctx.service.group.groupDetail(testData.user.id, newGroupId)

    assert(newGroup.id === newGroupId)
    assert(newGroup.groupName === newGroupPayload.group_name)
  })

  it('group member not found', async () => {
    const { user } = testData
    const randomId = Math.floor(Math.random() * 10000)

    try {
      await ctx.service.group.groupDetail(user.id, randomId)
    } catch (err) {
      assert.throws(
        () => {
          throw err
        },
        {
          message: 'GroupMember not found',
        }
      )
    }
  })

  it('my group list', async () => {
    const newGroupPayload = {
      groupName: Date.now() + '_newGroup',
      owner: testData.user.id,
    }

    const newGroupPayload2 = {
      groupName: Date.now() + '_newGroup',
      owner: testData.user2.id,
    }

    const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

    assert.ok(newGroupId)

    const newGroupId2 = await ctx.service.group.newGroup(newGroupPayload2)
    assert.ok(newGroupId2)

    const groupList = await ctx.service.group.myGroupList(testData.user.id)

    assert(groupList.length > 0)
    // 新用户默认会有一个 group
    assert(groupList.length === 2)

    const groupList2 = await ctx.service.group.myGroupList(testData.user2.id)

    assert(groupList2.length > 0)
    // 新用户默认会有一个 group
    assert(groupList2.length === 2)
  })

  it('create a group', async () => {
    const newGroupPayload = {
      groupName: Date.now() + '_newGroup',
      owner: testData.user.id,
    }

    const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

    assert.ok(newGroupId)
  })

  it('update group', async () => {
    const newGroupPayload = {
      groupName: Date.now() + '_newGroup',
      owner: testData.user.id,
      color: 'red',
      mute: '1',
    }

    const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

    assert.ok(newGroupId)

    const newName = Date.now() + '_update_newGroup'
    const newColor = 'blue'
    const newMute = '2'

    const updateGroup = await ctx.service.group.update({
      currentUser: testData.user,
      groupId: newGroupId,
      name: newName,
      color: newColor,
      mute: newMute,
    })

    assert.ok(updateGroup)

    const newGroup = await ctx.service.group.groupDetail(testData.user.id, newGroupId)

    assert(newGroup.group_name === newName)
    assert(newGroup.color === newColor)
    assert(newGroup.mute === newMute)
  })

  it('update not found', async () => {
    const { user } = testData.user
    const randomId = Math.floor(Math.random() * 1000)

    try {
      await ctx.service.group.update({
        currentUser: user,
        groupId: randomId,
      })
    } catch (err) {
      assert.throws(
        () => {
          throw err
        },
        {
          message: 'Group not found',
        }
      )
    }
  })

  describe('remove group', () => {
    it('remove owner group', async () => {
      const newGroupPayload = {
        groupName: Date.now() + '_newGroup',
        owner: testData.user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      await ctx.service.group.remove({ groupId: newGroupId, user: testData.user })

      const findGroup = await ctx.service.group.groupDetail(testData.user.id, newGroupId)

      assert(findGroup.is_deleted === true)
    })

    // 使用 user 账号删除 user2 的 group
    it('remove other user group', async () => {
      const { user, user2 } = testData
      const groupList = await ctx.service.group.myGroupList(user2.id)

      assert(groupList.length > 0)

      const defaultGroup = R.find(R.propEq('group_owner_id', user2.id), groupList)

      try {
        await ctx.service.group.remove({ groupId: defaultGroup.id, user })
      } catch (err) {
        // 删除失败
        assert.throws(
          () => {
            throw err
          },
          {
            message: 'Group not found',
          }
        )
      }
    })

    it('group not found', async () => {
      const { user } = testData
      const randomId = Math.floor(Math.random() * 10000)

      try {
        await ctx.service.group.remove({ groupId: randomId, user })
      } catch (err) {
        assert.throws(
          () => {
            throw err
          },
          {
            message: 'Group not found',
          }
        )
      }
    })

    it('default group remove', async () => {
      const { user } = testData
      // 找到自己的默认组
      const groupList = await ctx.service.group.myGroupList(user.id)
      const defaultGroup = R.find(R.propEq('group_owner_id', user.id), groupList)

      // 删除
      try {
        await ctx.service.group.remove({ groupId: defaultGroup.id, user })
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

  describe('member', function() {
    it('addMember', async () => {
      const { user, user2 } = testData

      const newGroupPayload = {
        groupName: Date.now() + '_newGroup',
        owner: user.id,
      }

      const oldMyGroupList = await ctx.service.group.myGroupList(user2.id)
      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert(newGroupId > 0)
      assert(oldMyGroupList.length === 1)

      await ctx.service.group.addMember({ groupId: newGroupId, user: user2, currentUser: user })

      await ctx.service.group.myGroupList(user2.id)

      const newMyGroupList = await ctx.service.group.myGroupList(user2.id)

      assert(newMyGroupList.length === 2)
    })

    it('removeMember success', async () => {
      const { user, user2 } = testData

      const newGroupPayload = {
        groupName: Date.now() + '_newGroup',
        owner: user.id,
      }

      const oldMyGroupList = await ctx.service.group.myGroupList(user2.id)
      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert(newGroupId > 0)
      assert(oldMyGroupList.length === 1)

      await ctx.service.group.addMember({ groupId: newGroupId, user: user2, currentUser: user })

      await ctx.service.group.myGroupList(user2.id)

      const newMyGroupList = await ctx.service.group.myGroupList(user2.id)

      assert(newMyGroupList.length === 2)

      // remove

      await ctx.service.group.removeMember({ groupId: newGroupId, user: user2, currentUser: user })

      const newMyGroupList2 = await ctx.service.group.myGroupList(user2.id)

      assert(newMyGroupList2.length === 1)
    })
  })

  describe('invite group', () => {
    it('invite lists', async () => {
      const { user, user2 } = testData

      const invites = await ctx.service.group.invites(user.id)

      assert(invites.length === 0)

      const newGroupPayload = {
        groupName: Date.now() + '_newGroup',
        owner: user2.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      const newInvite = await ctx.service.group.inviteUserInGroup({
        groupId: newGroupId,
        user,
        currentUser: user2,
      })

      assert(newInvite.id)

      const invites2 = await ctx.service.group.invites(user.id)

      assert(invites2.length === 1)
      assert(invites2[0].group_id === newGroupId)
      assert(invites2[0].invite_user === user.id)
    })

    it('invite user', async () => {
      const { user, user2 } = testData
      const newGroupPayload = {
        groupName: Date.now() + '_newGroup',
        owner: user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      await ctx.service.group.inviteUserInGroup({
        groupId: newGroupId,
        user: user2,
        currentUser: user,
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
      const { user } = testData
      const newGroupPayload = {
        groupName: Date.now() + '_newGroup',
        owner: user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      try {
        await ctx.service.group.inviteUserInGroup({
          groupId: newGroupId,
          user,
          currentUser: user,
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
      const { user, user2 } = testData
      const randomId = Math.floor(Math.random() * 10000)

      try {
        await ctx.service.group.inviteUserInGroup({
          groupId: randomId,
          user: user2,
          currentUser: user,
        })
      } catch (err) {
        assert.throws(
          () => {
            throw err
          },
          {
            message: 'Group not found',
          }
        )
      }
    })

    it('invite permissions error', async () => {
      const { user, user2 } = testData
      const newGroupPayload = {
        groupName: Date.now() + '_newGroup',
        owner: user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      try {
        await ctx.service.group.inviteUserInGroup({
          groupId: newGroupId,
          user,
          currentUser: user2,
        })
      } catch (err) {
        assert.throws(
          () => {
            throw err
          },
          {
            message: "You're not an group owner",
          }
        )
      }
    })

    it('reject invite', async () => {
      const { user, user2 } = testData
      const newGroupPayload = {
        groupName: Date.now() + '_newGroup',
        owner: user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      await ctx.service.group.inviteUserInGroup({
        groupId: newGroupId,
        user: user2,
        currentUser: user,
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
      const { user, user2 } = testData
      const newGroupPayload = {
        groupName: Date.now() + '_newGroup',
        owner: user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      await ctx.service.group.inviteUserInGroup({
        groupId: newGroupId,
        user: user2,
        currentUser: user,
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
        groupName: Date.now() + '_newGroup',
        owner: user2.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      const newInvite = await ctx.service.group.inviteUserInGroup({
        groupId: newGroupId,
        user,
        currentUser: user2,
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
        groupId: newGroupId,
        user,
        currentUser: user2,
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
      const { user, user2 } = testData
      const newGroupPayload = {
        groupName: Date.now() + '_newGroup',
        owner: user.id,
      }

      const newGroupId = await ctx.service.group.newGroup(newGroupPayload)

      assert.ok(newGroupId)

      await ctx.service.group.inviteUserInGroup({
        groupId: newGroupId,
        user: user2,
        currentUser: user,
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
