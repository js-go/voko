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
    const user = await ctx.service.User.create({ phone, password });
    ctx.status = 201;
    ctx.body = user;
  }

  async authenticate() {
    const {ctx, config, app} = this;
    // const { phone, password } = ctx.request.body;
    // const user = await service.user.findUserByPhone(phone);
    
    // if (!user) {
    //   // user not found
    //   ctx.status = 401;
    //   return ctx.body = {
    //     message: 'user not found'
    //   }
    // } 
    // if (user.password != password) {
    //   // wrong password
    //   ctx.status = 401;
    //   return ctx.body = {
    //     message: 'wrong password'
    //   }
    // }
    const secret = config.jwt.secret;
    var token = app.jwt.sign({ id: 'bar' }, secret);
    
    ctx.status = 200;
    return ctx.body = {
      message: 'success',
      token: token
    }
  }
}

module.exports = UserController;