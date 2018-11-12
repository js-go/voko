const Service = require('egg').Service

class UserService extends Service {
  async find(uid) {
    const user = await this.ctx.db.query('select * from user where uid = ?', uid)
    return user
  }

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

  async saveTodoItem() {
    const item = new this.ctx.model.TodoItem()
    item.content = 'test'
    item.tid = '1'
    return item.save()
  }
}

module.exports = UserService
