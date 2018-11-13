const Controller = require('egg').Controller;

class TodoController extends Controller {
  async add() {
    const { ctx } = this;
    const { uid, name, exp_date, list } = ctx.request.body
    let tid;
    // 1.生成todo
    try {
      tid = await ctx.service.todo.createTodo(uid, name, exp_date)
    } catch(e) {
      return ctx.body = {
        status: 500,
        message: 'error'
      }
    }
    
    // 2.把todo items插入到对应的todo
    // ModelInstance.bulkCreate 批量插入
    try {
      await ctx.service.todo.createItemList(tid, list)
      return ctx.body = {
        status: 201, //created
        message: 'success'
      }
    } catch(e) {
      return ctx.body = {
        status: 500,
        message: 'error'
      }
    }
  }

  async listAll() {
    const { ctx } = this;
    const query = ctx.query;
    const page = query.page || 1;
    const limit = query.limit || 10;
    const list = await ctx.service.todo.listAll(page, limit)
    return ctx.body = {
      status: 200,
      message: 'success',
      data: {
        list: list
      }
    }
  }

  async getTodoItem() {
    const { ctx } = this;
    const query = ctx.query;
    const id = query.id;
    const item = await ctx.service.todo.getTodoItem(id)
    return ctx.body = {
      status: 200,
      message: 'success',
      data: {
        item: item
      }
    }
  }

  async updateTodoItem() {
    const { ctx } = this;
    const { id } = ctx.request.body
    await ctx.service.todo.updateTodo(id)
    return ctx.body = {
      status: 200,
      message: 'success'
    }
  }

  async delectTodoItem() {
    const { ctx } = this;
    const query = ctx.query;
    const id = query.id;
    try {
      await ctx.service.todo.delectTodo(id)
      return ctx.body = {
        status: 200,
        message: 'success'
      }
    } catch (e) {
      return ctx.body = {
        status: 500,
        message: 'error'
      }
    }
  }
}

module.exports = TodoController;
