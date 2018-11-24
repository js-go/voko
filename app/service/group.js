const Service = require('egg').Service
const R = require('ramda')
const { addDays, isBefore } = require('date-fns')

function groupExist(group) {
  return group && !group.is_deleted
}

class GroupService extends Service {
  async newGroup({ groupName, owner, isDefault = false }) {
    const group = new this.ctx.model.Group()
    group.group_name = groupName
    group.group_owner_id = owner
    group.can_delete = !isDefault

    const newGroup = await group.save()

    await this._addMember(newGroup.id, owner)

    return newGroup.id
  }

  async remove({ groupId, user }) {
    const find_group = await this.ctx.model.Group.findOne({
      where: {
        id: groupId,
        group_owner_id: user.id, // 只能删除自己的
      },
    })

    if (!groupExist(find_group)) {
      throw new Error('Group not found')
    }

    if (!find_group.can_delete) {
      throw new Error('不能删除默认组')
    }

    await find_group.update({
      is_deleted: true,
    })
  }

  async update({ groupId, currentUser, name, color, mute }) {
    const find_group = await this.ctx.model.Group.findOne({
      where: {
        id: groupId,
      },
    })

    if (!groupExist(find_group)) {
      throw new Error('Group not found')
    }

    const groupMember = await this.ctx.model.GroupMember.findOne({
      where: {
        group_id: groupId,
        user_id: currentUser.id,
      },
    })

    if (this.isGroupOwner(find_group, currentUser)) {
      await find_group.update({
        group_name: name,
      })
    }

    const updateBody = {}

    if (color) {
      updateBody.color = color
    }

    if (mute) {
      updateBody.mute = mute
    }

    if (R.keys(updateBody).length > 0) {
      await groupMember.update(updateBody, {
        fields: [ 'color', 'mute' ],
      })
    }

    return true
  }

  /**
   * group detail
   *
   * @param {number} groupId
   */
  async groupDetail(userId, groupId) {
    const groupMember = await this.ctx.model.GroupMember.findOne({
      where: {
        group_id: groupId,
        user_id: userId,
      },

      attributes: [ 'user_id', 'join_date', 'color', 'mute' ],
    })

    if (!groupMember) {
      throw new Error('GroupMember not found')
    }

    const group = await this.ctx.model.Group.findOne({
      where: {
        id: groupId,
      },
      attributes: [ 'id', 'group_name', 'group_owner_id', 'can_delete', 'is_deleted', 'created_at', 'updated_at' ],
    })

    // if (!group) {
    //   throw new Error('Group not found')
    // }

    const buildData = {
      ...group.get({ plain: true }),
      ...groupMember.get({ plain: true }),
      todo: {
        total: 0,
        remain: 0, // total - done
        done: 0,
      },
    }

    return buildData
  }

  async addMember({ groupId, user, currentUser }) {
    const findGroup = await this.ctx.model.Group.findOne({
      where: {
        id: groupId,
      },
    })

    this.isGroupOwner(findGroup, currentUser)

    return await this._addMember(groupId, user.id)
  }

  async _addMember(groupId, userId) {
    const isExistMember = await this.ctx.model.GroupMember.findOne({
      where: {
        group_id: groupId,
        user_id: userId,
      },
      attributes: [ 'id' ],
    })

    if (isExistMember) {
      return
    }

    const newMember = new this.ctx.model.GroupMember()
    newMember.group_id = groupId
    newMember.user_id = userId
    newMember.join_date = Date.now()

    await newMember.save()

    return true
  }

  async removeMember({ groupId, user, currentUser }) {
    const find_group = await this.ctx.model.Group.findOne({
      where: {
        id: groupId,
      },
    })

    this.isGroupOwner(find_group, currentUser)

    const isExistMember = await this.ctx.model.GroupMember.findAll({
      where: {
        group_id: groupId,
        user_id: user.id,
      },
      attributes: [ 'id' ],
    })

    if (isExistMember) {
      await isExistMember.destroy()
    }

    return true
  }

  /**
   * 用户 group list
   *
   * @param {string} userId
   */
  async myGroupList(userId) {
    const join_groups = await this.ctx.model.GroupMember.findAll({
      where: {
        user_id: userId,
      },
      order: [[ 'join_date', 'DESC' ]],
      attributes: [ 'group_id', 'color', 'mute' ],
      include: [
        {
          model: this.ctx.model.Group,
          attributes: [ 'id', 'group_name', 'group_owner_id', 'can_delete', 'is_deleted', 'created_at', 'updated_at' ],
        },
      ],
    })

    const groups = []

    for (const item of join_groups) {
      const members = await item.group.getGroup_members({
        attributes: [ 'user_id', 'join_date' ],
      })
      groups.push({
        ...item.group.get({ plain: true }),
        todo: {
          total: 0,
          remain: 0, // total - done
          done: 0,
        },
        color: item.color,
        mute: item.mute,
        members: members.map(x => x.get({ plain: true })),
      })
    }

    return groups
  }

  /**
   * user invites
   *
   * @param {number} user_id
   */
  async invites(userId) {
    const res = await this.ctx.model.GroupInvite.findAll({
      where: {
        invite_user: userId,
      },
    })

    return res
  }

  async inviteUserInGroup({ groupId, user, currentUser }) {
    if (user.id === currentUser.id) {
      throw new Error("You can't invite yourself")
    }

    const find_group = await this.ctx.model.Group.findOne({
      where: {
        id: groupId,
      },
    })

    this.isGroupOwner(find_group, currentUser)

    const newGroupInvite = new this.ctx.model.GroupInvite()
    newGroupInvite.invite_user = user.id
    newGroupInvite.group_id = groupId
    newGroupInvite.expire_date = addDays(new Date(), 7)
    await newGroupInvite.save()

    return newGroupInvite
  }

  /**
   * 是否同意邀请
   */
  async acceptGroupInvite({ inviteId, currentUser, accept }) {
    const find_invite = await this.ctx.model.GroupInvite.findOne({
      where: {
        id: inviteId,
      },
    })

    if (!find_invite) {
      throw new Error('invite not found')
    }

    if (find_invite.invite_user !== currentUser.id) {
      throw new Error('invite user error')
    }

    if (isBefore(find_invite.expire_date, new Date())) {
      throw new Error('invite expire')
    }

    // 已进入
    const is_existMember = await this.ctx.model.GroupMember.findAll({
      where: {
        group_id: find_invite.group_id,
        user_id: currentUser.id,
      },
    })

    if (is_existMember && is_existMember.length > 0) {
      throw new Error('user exist')
    }

    if (accept) {
      await this._addMember(find_invite.group_id, currentUser.id)
      await find_invite.destroy()
    } else {
      await find_invite.destroy()
    }
  }

  isGroupOwner(group, user) {
    if (!groupExist(group)) {
      throw new Error('Group not found')
    }

    if (group.group_owner_id !== user.id) {
      throw new Error("You're not an group owner")
    }

    return true
  }
}

module.exports = GroupService
