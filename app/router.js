'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  const tokenRequired = middleware.tokenRequired();
  // user
  router.post('/user/register', controller.users.create);
  router.get('/user/list/:id', tokenRequired, controller.users.list);
  router.get('/test', controller.users.test);
  // authentication
  router.post('/authenticate', controller.users.authenticate);
};

/**
 * TODO
 * 
 * /authenticate - [post] 登录 获取jwt token
 * 
 * /user/register 新增用户
 * /user/resetpassword
 * /user/list/:id 获取用户基本信息
 *  */