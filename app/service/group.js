const Service = require('egg').Service
const R = require('ramda')
const { addDays } = require('date-fns')

function isGroupOwner(group, user) {
  return group.group_owner_id === user.id
}

function groupExist(group) {
  return group && !group.is_deleted
}

class GroupService extends Service {
  async newGroup({ group_name, owner, is_default = false }) {
    const group = new this.ctx.model.Group()
    group.group_name = group_name
    group.group_owner_id = owner
    group.can_delete = !is_default

    const newGroup = await group.save()

    await this.addMember(newGroup.id, owner)

    return newGroup.id
  }

  async remove({ group_id, user_id }) {
    const find_group = await this.ctx.model.Group.findOne({
      where: {
        id: group_id,
        group_owner_id: user_id, // 只能删除自己的
      },
    })

    if (!groupExist(find_group)) {
      throw new Error('group not found')
    }

    if (!find_group.can_delete) {
      throw new Error('不能删除默认组')
    }

    try {
      await find_group.update({
        is_deleted: true,
      })
    } catch (err) {
      this.ctx.logger.error(err)
      throw new Error('删除出错')
    }
  }

  async update({ current_user, group_id, name, color, mute }) {
    const find_group = await this.ctx.model.Group.findOne({
      where: {
        id: group_id,
      },
    })

    if (!groupExist(find_group)) {
      throw new Error('group not found')
    }

    const groupMember = await this.ctx.model.GroupMember.findOne({
      where: {
        group_id,
        user_id: current_user.id,
      },
    })

    if (isGroupOwner(find_group, current_user)) {
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
   * @param {number} group_id
   */
  async groupDetail(user_id, group_id) {
    const groupMember = await this.ctx.model.GroupMember.findOne({
      where: {
        group_id,
        user_id,
      },

      attributes: [ 'user_id', 'join_date', 'color', 'mute' ],
    })

    if (!groupMember) {
      return null
    }

    const group = await this.ctx.model.Group.findOne({
      where: {
        id: group_id,
      },
      attributes: [ 'id', 'group_name', 'group_owner_id', 'can_delete', 'is_deleted', 'created_at', 'updated_at' ],
    })

    if (!group) {
      return null
    }

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

  async addMember(group_id, user_id) {
    const is_existMember = this.ctx.model.GroupMember.findOne({
      where: {
        group_id,
        user_id,
      },
    })

    if (is_existMember && is_existMember.length > 0) {
      console.info('加入失败，用户已加入')
      return false
    }

    const newMember = new this.ctx.model.GroupMember()
    newMember.group_id = group_id
    newMember.user_id = user_id
    newMember.join_date = Date.now()

    await newMember.save()

    return true
  }

  async removeMember({ group_id, user_id, current_user }) {
    const find_group = await this.ctx.model.Group.findOne({
      where: {
        id: group_id,
      },
    })

    if (!groupExist(find_group)) {
      throw new Error('group not found')
    }

    if (!isGroupOwner(find_group, current_user)) {
      // 只能创建者删除成员
      this.ctx.throw(401, 'remove error')
      return
    }

    const is_existMember = this.ctx.model.GroupMember.findOne({
      where: {
        group_id,
        user_id,
      },
    })

    if (is_existMember && is_existMember.length > 0) {
      await is_existMember.destroy()
    }

    return true
  }

  /**
   * 用户 group list
   *
   * @param {string} user_id
   */
  async myGroupList(user_id) {
    const join_groups = await this.ctx.model.GroupMember.findAll({
      where: {
        user_id,
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

  async inviteUserInGroup({ group_id, user_id, current_user }) {
    if (user_id === current_user.id) {
      throw new Error("You can't invite yourself")
    }

    const find_group = await this.ctx.model.Group.findOne({
      where: {
        id: group_id,
      },
    })

    if (!groupExist(find_group)) {
      throw new Error('Group not found')
    }

    if (!isGroupOwner(find_group, current_user)) {
      throw new Error("You're not an group owner")
    }

    const newGroupInvite = new this.ctx.model.GroupInvite()
    newGroupInvite.invite_user = user_id
    newGroupInvite.group_id = group_id
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
      await this.ctx.service.group.addMember(find_invite.group_id, currentUser.id)
      await find_invite.destroy()
    } else {
      await find_invite.destroy()
    }
  }
}

module.exports = GroupService
