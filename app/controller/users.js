const Controller = require('egg').Controller;

class UserController extends Controller {
  async list() {
    const ctx = this.ctx;
    ctx.status = 200;
    ctx.body = 'hi eep';
  }

  async create() {
    const ctx = this.ctx;
    const { phone, password } = ctx.request.body;
    const passhash = ctx.helper.bhash(password);
    const user = await ctx.service.user.create({phone, passhash});
    if (user) {
      // 新增用户时，创建默认组
      await ctx.service.group.create(user.id);
      ctx.status = 201;
      return ctx.body = {
        status: 201,
        message: 'success'
      };
    }
    ctx.status = 500;
    return ctx.body = {
      status: 500,
      message: 'fail'
    }
  }

  async test() {
    const {ctx} = this;
    await ctx.service.user.saveTodoItem();
    ctx.body = 'ok'
  }

  async authenticate() {
    const {ctx, config, app} = this;
    const secret = config.jwt.secret;
    const {phone, password} = ctx;
    const user = await ctx.service.user.findUserByPhone(phone);
    const fail = function() {
      return ctx.body = {
        status: 500,
        message: 'fail'
      };
    }
    if (user) {
      const passhash = user.password;
      const equal = ctx.helper.bcompare(password, passhash);
      if (!equal) fail();
    } else {
      fail();
    }
    var token = app.jwt.sign({ id: user.id }, secret);
    ctx.status = 200;
    return ctx.body = {
      status: 200,
      message: 'success',
      data: {
        token: token
      }
    }
  }
}

module.exports = UserController;