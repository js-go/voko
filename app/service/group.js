const Service = require('egg').Service;

class GroupService extends Service {
  async create(uid) {
    const group = new this.ctx.model.Group();
    group.group_name = '默认';
    group.uid = uid;
    return group.save();
  }
}

module.exports = GroupService;