const Service = require('egg').Service
const Sequelize = require('sequelize')
const R = require('ramda')
const { addDays } = require('date-fns')

class GroupService extends Service {
  isGroupOwner(group, user) {
    return group.group_owner_id === user.id
  }

  groupExist(group) {
    return group && group.is_deleted
  }

  async create({ group_name, owner, is_default }) {
    const group = new this.ctx.model.Group()
    group.group_name = '1'
    group.group_owner_id = owner
    group.can_delete = !is_default

    const newGroup = await group.save()

    await this.addMember(newGroup.id, owner)

    return newGroup
  }

  async remove({ group_id, user_id }) {
    const find_group = await this.ctx.model.Group.findOne({
      where: {
        id: group_id,
        group_owner_id: user_id, // 只能删除自己的
      },
    })

    if (!this.groupExist(find_group)) {
      throw new Error('group not found')
    }

    if (!find_group.can_delete) {
      throw new Error('不能删除默认组')
    }

    return await find_group.update({
      is_deleted: true,
    })
  }

  async update({ current_user, group_id, name, color }) {
    const find_group = await this.ctx.model.Group.findOne({
      where: {
        id: group_id,
      },
    })

    if (!this.groupExist(find_group)) {
      throw new Error('group not found')
    }

    if (this.isGroupOwner(find_group)) {
      await find_group.update({
        group_name: name,
      })
    }

    // update user custom settings
    const groupSetting = this.ctx.model.GroupSetting.findOne({
      user_id: current_user.id,
      group_id,
    })

    if (groupSetting) {
      await groupSetting.update({
        color,
      })
    } else {
      const newGroupSetting = new this.ctx.model.GroupSetting({
        user_id: current_user.id,
        group_id,
        color,
      })

      await newGroupSetting.save()
    }

    return true
  }

  async addMember(group_id, user_id) {
    const is_existMember = this.ctx.model.GroupMember.find({
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

    if (!this.groupExist(find_group)) {
      throw new Error('group not found')
    }

    if (!this.isGroupOwner(find_group, current_user)) {
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

  async myGroupList(user_id) {
    const join_groups = await this.ctx.model.GroupMember.findAll({
      where: {
        user_id,
      },
      order: [['join_date', 'DESC']],
      attributes: ['group_id', 'color', 'mute'],
    })

    const group_ids = R.pluck('group_id', join_groups)

    const getGroupInfoTasks = R.map(({ group_id, color, mute }) => {
      return this.ctx.model.Group.findOne({ where: group_id }).then(res => ({
        ...res.dataValues,
        color,
        mute,
      }))
    }, join_groups)

    return await Promise.all(getGroupInfoTasks)
  }

  async inviteUserInGroup({ group_id, user_id, current_user }) {
    const find_group = await this.ctx.model.Group.findOne({
      where: {
        id: group_id,
      },
    })

    if (!this.groupExist(find_group)) {
      throw new Error('group not found')
    }

    if (!this.isGroupOwner(find_group, current_user)) {
      throw new Error('只能创建者邀请加入')
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
  async acceptGroupInvite({ invite_id, current_user, accept }) {
    const find_invite = this.ctx.model.GroupInvite.findOne({
      where: {
        id: invite_id,
      },
    })

    if (!find_invite) {
      throw new Error('invite not found')
    }

    if (find_invite.invite_user !== user.id) {
      throw new Error('invite error')
    }

    // 如果已进入
    const is_existMember = this.ctx.model.GroupMember.find({
      where: {
        group_id: find_invite.group_id,
        user_id: user.id,
      },
    })

    if (is_existMember && is_existMember.length > 0) {
      throw new Error('error')
    }

    if (accept) {
      await this.ctx.service.addMember(find_invite.group_id, user.id)
    } else {
      await find_invite.destroy()
    }

    return
  }
}

module.exports = GroupService
