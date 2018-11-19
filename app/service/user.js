const Service = require('egg').Service

class UserService extends Service {

  async create({ phone, password, username }) {
    const user = new this.ctx.model.User()
    user.username = username
    user.phone = phone
    user.password = password
    return user.save()
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
