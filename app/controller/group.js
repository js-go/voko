const Controller = require('egg').Controller

class GroupController extends Controller {
  /*
   * /group/update 更新组
   * /group/member/invite/:id 添加成员
   * /group/member/delect/:id 删除成员
   * */

  /**
   * group list
   *
   */
  async list() {
    const { id } = this.ctx.request.user
    try {
      const data = await this.ctx.service.group.myGroupList(id)
      this.ctx.body = {
        code: 200,
        message: '',
        data,
      }
    } catch (err) {
      this.ctx.body = {
        code: 500,
        message: '',
        data: err.message,
      }
    }
  }

  /**
   * 创建 Group
   */
  async createGroup() {
    const { id } = this.ctx.request.user
    const { name } = this.ctx.request.body

    try {
      const data = await this.ctx.service.group.newGroup({ group_name: name, owner: id })

      this.ctx.body = {
        code: 200,
        data,
      }
    } catch (err) {
      this.ctx.body = {
        code: 500,
        message: 'create group error',
      }
    }
  }

  /**
   * 删除 Group
   *
   */
  async removeGroup() {
    const { id } = this.ctx.request.user
    const { group_id } = this.ctx.params

    try {
      await this.ctx.service.group.remove({ group_id, user_id: id })

      this.ctx.body = {
        code: 200,
        message: 'ok',
      }
    } catch (err) {
      console.log(err)
      this.ctx.body = {
        code: 200,
        message: err.message,
      }
    }
  }

  async updateGroup() {
    const { user } = this.ctx.request
    const { group_id, new_name, color } = this.ctx.request.body

    try {
      this.ctx.service.Group.update({ group_id, new_name, color, current_user: user })

      this.ctx.body = {
        code: 200,
        message: 'update ok',
      }
    } catch (err) {
      this.ctx.body = {
        code: 500,
        message: err.message,
      }
    }
  }

  /**
   * 将用户从 Group 中移除
   *
   */
  async removeMember() {
    const { user } = this.ctx.request
    const { group_id, user_id } = this.ctx.params

    try {
      await this.ctx.service.group.removeMember({ group_id, user_id, current_user: user })

      this.ctx.body = {
        code: 200,
        message: 'ok',
      }
    } catch (err) {
      this.ctx.body = {
        code: 500,
        message: err.message,
      }
    }
  }

  /**
   * 邀请用户进入 Group
   *
   */
  async inviteUser() {
    const { user_id } = this.ctx.params
    const { user } = this.ctx.request
    const { group_id } = this.ctx.request.body

    try {
      await this.ctx.service.inviteUserInGroup({ group_id, user_id, current_user: user })

      this.ctx.body = {
        code: 200,
        message: 'ok',
      }
    } catch (err) {
      this.ctx.body = {
        code: 500,
        message: err.message,
      }
    }
  }

  /**
   * 是否同意邀请
   */
  async acceptGroupInvite() {
    const { invite_id } = this.ctx.params
    const { user } = this.ctx.request
    const { accept } = this.ctx.request.body

    try {
      this.ctx.service.Group.processGroupInvite({ invite_id, current_user: user, accept })
      this.ctx.body = {
        code: 200,
        message: 'ok',
      }
    } catch (err) {
      this.ctx.body = {
        code: 500,
        message: err.message,
      }
    }
  }
}

module.exports = GroupController
