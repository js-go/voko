'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app

  const tokenRequired = middleware.tokenRequired()
  // user
  router.post('/user/register', controller.users.create)
  
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
  router.get('/todo/list/:page', controller.todo.list)
  router.get('/todo/list/:id', controller.todo.getTodoItem)
  router.post('/todo/todo_update', controller.todo.updateTodo)
  router.post('/todo/item_update', controller.todo.updateTodoItem)
  router.delete('/todo/list/:id', controller.todo.delectTodoItem)

}
