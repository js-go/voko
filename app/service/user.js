const Service = require('egg').Service

class UserService extends Service {
  /**
   * 创建用户
   *
   * @param {{phone: string, password: string ,username: string}} user user
   * @return {Promise<User>} user
   */
  async newUser({ phone, password, username }) {
    const passhash = this.ctx.helper.bhash(password)

    const user = new this.ctx.model.User()
    user.username = username
    user.phone = phone
    user.password = passhash

    const newUser = await user.save()

    // 新增用户时，创建默认组
    await this.ctx.service.group.newGroup({ group_name: '默认', owner: user.id, is_default: true })

    return this.safeUser(newUser)
  }

  /**
   * 过滤用户返回字段
   *
   * @param {any} user user
   * @return {any} user
   */
  safeUser(user) {
    return {
      id: user.id,
      username: user.username,
      phone: user.phone,
    }
  }

  /**
   * 生成用户访问 Token
   *
   * @param {any} payload payload
   * @return {string} payload
   */
  generateAccessToken(payload) {
    const { jwt } = this.app.config

    return this.app.jwt.sign(payload, jwt.secret)
  }

  verifyToken(token) {
    const { jwt } = this.app.config

    return this.ctx.app.jwt.verify(token, jwt.secret)
  }

  async getUserById(id) {
    return this.ctx.model.User.findOne({
      where: {
        id,
      },
    })
  }

  async findUserByPhone(phone) {
    return this.ctx.model.User.findOne({
      where: {
        phone,
      },
    })
  }
}

module.exports = UserService
