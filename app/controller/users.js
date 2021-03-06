const Controller = require('egg').Controller

class UserController extends Controller {
  async create() {
    const { ctx, config, app } = this
    const { phone, password } = ctx.request.body

    const userExist = await ctx.service.user.findUserByPhone(phone)

    if (userExist) {
      ctx.status = 500
      ctx.body = {
        status: 500,
        message: 'phone has been used.',
      }
      return
    }

    const user = await ctx.service.user.newUser({ phone, password, username: '' })

    if (user) {
      const token = ctx.service.user.generateAccessToken({ id: user.id })

      ctx.status = 201
      ctx.body = {
        status: 201,
        message: 'success created',
        data: {
          token,
        },
      }

      return
    }

    ctx.status = 500
    ctx.body = {
      status: 500,
      message: 'fail',
    }
    return
  }

  async authenticate() {
    const { ctx, config, app } = this
    const secret = config.jwt.secret
    const { phone, password } = ctx.request.body
    const user = await ctx.service.user.findUserByPhone(phone)

    const fail = function() {
      ctx.status = 400
      ctx.body = {
        status: 500,
        message: 'fail',
      }
      return
    }

    if (user) {
      const passhash = user.password
      const equal = ctx.helper.bcompare(password, passhash)
      if (!equal) {
        fail()
      }
    } else {
      fail()
      return
    }

    const token = app.jwt.sign({ id: user.id }, secret)

    ctx.status = 200
    ctx.body = {
      status: 200,
      message: 'success',
      data: {
        token,
      },
    }

    return
  }
}

module.exports = UserController
