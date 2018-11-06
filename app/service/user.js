const Service = require('egg').Service;

class UserService extends Service {
  async find(uid) {
    const user = await this.ctx.db.query('select * from user where uid = ?', uid);
    return user;
  }
  
  async create(phone, password) {
    const user = new this.ctx.model.User();
    user.phone = phone;
    user.password = password;
    return user.save();
  }

  async getUserById(id) {
    return Promise.resolve({
      id:1,
      password: '123',
      name: 'eep'
    });
  }

  async findUserByPhone(id) {
    return Promise.resolve({
      id:1,
      password: '123',
      name: 'eep'
    });
  }

  async saveTodoItem() {
    const item = new this.ctx.model.TodoItem();
    item.content = 'test';
    item.tid = '1';
    return item.save();
  }

}

module.exports = UserService;