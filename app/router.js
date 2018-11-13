'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app

  const tokenRequired = middleware.tokenRequired()
  // user
  router.post('/user/register', controller.users.create)
  router.get('/user/list/:id', tokenRequired, controller.users.list)
  
  // authenticate
  router.post('/authenticate', controller.users.authenticate)

  // Group Router
  router.get('/group/list', tokenRequired, controller.group.list)
  router.post('/group/add', tokenRequired, controller.group.createGroup)
  router.delete('/group/:group_id', tokenRequired, controller.group.removeGroup)
  router.delete('/group/:group_id/member/:user_id', tokenRequired, controller.group.removeMember)

  router.post('/group/invite/:user_id', tokenRequired, controller.group.inviteUser)
  router.put('/group/invite/:invite_id', tokenRequired, controller.group.acceptGroupInvite)
  router.get('/group/search', tokenRequired)

  router.get('/search/group', tokenRequired)

  // Todo 
  router.post('/todo/add', controller.todo.add)
  router.get('/todo/list', controller.todo.listAll)
  router.get('/todo/list/:id', controller.todo.getTodoItem)
  router.put('/todo/list/:id', controller.todo.updateTodoItem)
  router.delete('/todo/list/:id', controller.todo.delectTodoItem)

}

/**
 * TODO
 *
 * /authenticate - [post] 登录 获取jwt token
 *
 * /user/register 新增用户
 * /user/resetpassword
 * /user/list/:id 获取用户基本信息
 *  */
