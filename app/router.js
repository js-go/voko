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
 * 
 * /group/add 创建组
 * /group/list 获取组列表
 * /group/update 更新组
 * /group/delect/:id 删除组
 * /group/member/invite/:id 添加成员
 * /group/member/delect/:id 删除成员
 * 
 * /todo/add  - [post] 新增todo
 * /todo/list - [get]  获取全部列表
 * /todo/list/:id - [get] 获取todo详情
 * /todo/list/:id - [put] 更新todo
 * /todo/list/:id - [delect]  删除todo
 *  */