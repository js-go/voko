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
    // 生成密码hash
    const user = await ctx.service.User.create({phone, password});
    if (user) {
      ctx.status = 201;
      return ctx.body = {
        status: 200,
        message: 'success'
      };
    }
    ctx.status = 500;
    return ctx.body = {
      status: 500,
      message: 'fail'
    }
  }

  async authenticate() {
    const {ctx, config, app} = this;
    const secret = config.jwt.secret;
    // get user
    const {phone, password} = ctx;
    const user = await ctx.service.User.findUserByPhone(phone);
    if (user) {
       // compare password
      const passhash = user.password;
      const equal = ctx.helper.bcompare(password, passhash);
      if (!equal) return null;
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