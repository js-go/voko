'use strict'

const { app, assert } = require('egg-mock/bootstrap')
const { mysqlCleanUp, mysqlSetup } = require('../../dbSetup')

describe('test/app/service/todo.test.js', () => {
  let ctx

  before(async () => {
    ctx = app.mockContext()
  })

  before(async () => {
    this.testData = await mysqlSetup(ctx)
  })

  it('should create a todo', async () => {
    const uid = this.testData.user.id
    const id = await ctx.service.todo.createTodo(uid, '这是一条测试', '2018-12-12 12:12:12')
    assert(id)

    const list = '[{"tid":1,"content": "xxx1", "type": 1},{"tid":1,"content": "xxx2", "type": 1}]'
    const res = await ctx.service.todo.createItemList(list)
    assert(res.length > 0)
  })

})
