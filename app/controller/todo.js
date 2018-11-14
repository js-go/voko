const Controller = require('egg').Controller
const R = require('ramda')

class TodoController extends Controller {
  async add() {
    const { ctx } = this;
    const { uid, name, exp_date } = ctx.request.body
    let list = ctx.request.body.list
    let tid;
    try {
      tid = await ctx.service.todo.createTodo(uid, name, exp_date)
    } catch(e) {
      return ctx.body = {
        status: 500,
        message: 'error'
      }
    }
    list = JSON.parse(list)
    let newList = R.map(item => {
      item.tid = tid
      return item
    }, list);
    try {
      await ctx.service.todo.createItemList(newList)
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

  async list() {
    const { ctx } = this;
    const { uid } = ctx.request.user
    const query = ctx.query;
    const page = query.page || 1;
    const list = await ctx.service.todo.list(uid, page)
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
    await ctx.service.todo.updateTodoItem(id)
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
      await ctx.service.todo.delectTodoItem(id)
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
