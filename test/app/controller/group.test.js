'use strict';

const { app, mock, assert } = require('egg-mock/bootstrap');

describe('test/controller/group.test.js', () => {
  let ctx
  let user1
  let token 
  let group_name = '第一个组'

  before(async () => {
    ctx = app.mockContext()
    const phone = '18222279002'
    const password = 'test'
    const username = 'test'

    user1 = await ctx.service.user.newUser({ phone, password: phone, username: username })
    assert(user1.username === username);

    let token1 = await ctx.service.user.generateAccessToken({ id: user1.id })
    token = token1

  })


  it('get /group/list should ok', async () => {
    const result = await app.httpRequest().get(`/group/list?user=${user1.id}&token=${token}`);
    assert(result.body.code === 200);
  });


});
