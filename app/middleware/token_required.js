'use strict';

module.exports = () => {
  return async function(ctx, next) {
    let token = '';
    if (
      ctx.headers.authorization && ctx.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      token = ctx.headers.authorization.split(' ')[1];
    } else if (ctx.query.token) {
      token = ctx.query.token;
    } 
    const fail = (msg = 'valid fail') => {
      ctx.status = 400
      ctx.body = {
        code: 400,
        message: msg
      }
    }
    if (!token) return fail();
    const secret = ctx.app.config.jwt.secret;
    try {
      const decode = ctx.app.jwt.verify(token, secret);
      const user = await ctx.service.user.getUserById(decode.id);
      if (!user) {
        return fail();
      }
      ctx.request.user = user;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return fail('token expire')
      }
      return fail()
    }
    
    await next();
  };
};