const LocalStrategy = require('passport-local').Strategy;
const debug = require('debug')('egg-passport-local');

module.exports = app => {
  const localHandler = async (ctx, { username, password }) => {
    const getUser = username => {
      return ctx.service.user.findUserByPhone(username);
    };
    const existUser = await getUser(username);

    // 用户不存在
    if (!existUser) {
      return null;
    }

    // const passhash = existUser.password;
    // // TODO: change to async compare
    // const equal = ctx.helper.bcompare(password, passhash);
    // // 密码不匹配
    // if (!equal) {
    //   return null;
    // }

    // 验证通过
    return existUser;
  };

  // 挂载 strategy
  app.passport.use(new LocalStrategy({
    usernameField: 'phone',
    passwordField: 'password',
    passReqToCallback: true
  }, (req, username, password, done) => {
    // format user
    const user = {
      provider: 'local',
      username,
      password,
    };
    debug('%s %s get user: %j', req.method, req.url, user);
    app.passport.doVerify(req, user, done);
  }));

  // 处理用户信息
  app.passport.verify(async (ctx, user) => {
    ctx.logger.debug('passport.verify', user);
    const existUser = await localHandler(ctx, user);
    return existUser;
  });
  app.passport.serializeUser(async (ctx, user) => {});
  app.passport.deserializeUser(async (ctx, user) => {});
};
