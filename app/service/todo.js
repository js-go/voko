const Service = require('egg').Service
const R = require('ramda')
const sql = (str) => {
  return `SELECT ${str} FROM (SELECT g2.*, t.name, t.exp_date, t.is_done, t.created_at, t.id AS tid 
    FROM (SELECT u.username, g1.* 
    FROM users AS u LEFT JOIN (SELECT g.id AS gid, g.group_name, g.group_owner_id, gm.user_id 
    FROM groups AS g LEFT JOIN group_members AS gm ON g.id = gm.group_id) AS g1 ON g1.user_id= u.id) AS g2 
  LEFT JOIN todos AS t ON g2.user_id = t.uid) AS g3 LEFT JOIN todo_items AS ti ON g3.tid = ti.tid`
}

class TodoService extends Service {
  async createTodo(uid, gid, name, exp_date) {
    const todo = new this.ctx.model.Todo()
    const member = new this.ctx.model.GroupMember()
    todo.uid = uid
    todo.name = name
    todo.is_done = false
    todo.exp_date = exp_date
    member.group_id = gid
    member.user_id = uid
    try {
      await member.save()
      const item = await todo.save()
      return item.id
    } catch(e) {
      return null
    }
  }

  async createItemList(list) {
    const item = this.ctx.model.TodoItem
    try {
      return await item.bulkCreate(list)
    } catch(e) {
      return null
    }
  }

  async list(uid, page) {
    let pageSize = 10;
    const count_sql = sql('count(1) as total') + 'where g3.user_id = ?'
    const res = await this.ctx.db.query(count_sql, uid)
    const limit = (page - 1) * pageSize
    const list_sql = sql('g3.*, ti.id as item_id, ti.content,ti.type,ti.sms_msg,ti.sms_number,ti.phone,ti.map,ti.photo,ti.trip,ti.is_done AS item_done') + 'where g3.user_id = ? order by created_at desc limit ?, ' + pageSize
    const list = await this.ctx.db.query(list_sql, uid, limit)
    const total = Math.ceil(res.total / pageSize)
    return {
      total: total,
      list: list
    }
  }

  async getTodoItem(uid, id) {
    const sql = sql('g3.*, ti.id as item_id, ti.content,ti.type,ti.sms_msg,ti.sms_number,ti.phone,ti.map,ti.photo,ti.trip,ti.is_done AS item_done') + 'where g3.user_id = ? and ti.tid = ?'
    const item = await this.ctx.db.query(list_sql, uid, id)
    return item
  }

  async updateTodoItem(id, name, todo_is_done, content, type, sms_number, sms_msg, phone, map, photo, trip, item_is_done) {
    const todo = await this.ctx.model.TodoItem.findOne({
      where: {
        id: id
      },
    })
    const todoItems = await this.ctx.model.TodoItem.findAll({
      where: {
        tid: id
      },
    })
    
    function _update(list) {
      const promises = R.map((item) => {
        Promise.resolve().then(() => item.updateAttributes({
          content,
          type,
          sms_number,
          sms_msg,
          phone,
          map,
          photo,
          trip,
          is_done: item_is_done
        }))
      }, list)
      return promises
    }
    await todo.update({
      name,
      is_done: todo_is_done
    })
    await Promise.all(_update(todoItems))
    return null
  }

  async delectTodoItem(id) {
    const todo = await this.ctx.model.TodoItem.findOne({
      where: {
        id: id
      },
    })
    const todoItems = await this.ctx.model.TodoItem.findAll({
      where: {
        tid: id
      },
    })
    
    function _delect(list) {
      const promises = R.map((item) => {
        Promise.resolve().then(() => item.destroy())
      }, list)
      return promises
    }
    await todo.destroy()
    await Promise.all(_delect(todoItems))
    return null
  }
}

module.exports = TodoService
