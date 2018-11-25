'use strict';

const { app, mock, assert } = require('egg-mock/bootstrap');

describe('test/controller/group.test.js', () => {
  let ctx
  let user1
  let user2
  let token1
  let token2 
  let group_name = 'happyGroup'
  let group_id 

  before(async () => {
    ctx = app.mockContext()
    const usera = {
      phone : '18222279003',
      password : 'test',
      username : 'test'
    }

    const userb = {
      phone : '18222279004',
      password : 'test',
      username : 'test'
    }

    user1 = await ctx.service.user.newUser({password: usera.phone, username: usera.username })
    user2 = await ctx.service.user.newUser({password: userb.phone, username: userb.username })
    assert(user1.username === usera.username);
    assert(user2.username === userb.username);

    token1 = await ctx.service.user.generateAccessToken({ id: user1.id })
    token2 = await ctx.service.user.generateAccessToken({ id: user2.id })
    // user1创建一个组
    // group_id = await ctx.service.group.newGroup({ owner: user1.id ,token:token1 ,group_name:group_name})
    // 加入user2
    // let inviteUserIn = await ctx.service.group.inviteUserInGroup({ group_id:group_id, user_id:user2.id, current_user:user1,token:token2})
    // 返回：只能创建者邀请加入
    // assert(inviteUserIn.group_id === group_id);

    // let access = await ctx.service.group.acceptGroupInvite({ invite_id: user1.id , current_user:user2 ,accept:true})

    // assert(inviteUserIn.group_id === access);

  })

  it('post /group/add should ok', async () => {
    const result = await app.httpRequest().post(`/group/add?user=${user1.id}&token=${token1}&group_name=${group_name}`);
    group_id = result.body.data
    assert(result.body.code === 200);
  });


  it('get /group/list should ok', async () => {
    const result = await app.httpRequest().get(`/group/list?user=${user1.id}&token=${token1}`);
    assert(result.body.code === 200);
  });

  // it('delete /group/:group_id/member/:user_id should ok', async () => {
  //   const result = await app.httpRequest().get(`/group/list?user=${user1.id}&token=${token}`);
  //   assert(result.body.code === 200);
  // });

  it('delete /group/:group_id should ok', async () => {
    const result = await app.httpRequest().delete(`/group/${group_id}?user=${user1.id}&token=${token1}&group_id=${group_id}`);
    assert(result.body.code === 200);
  });

  // after(async () => {
  //   let inviteUserIn = await ctx.service.group.inviteUserInGroup({ group_id:group_id, user_id:user2.id, current_user:user1.id})
  //   // 返回：只能创建者邀请加入
  //   assert(inviteUserIn.group_id === group_id);

  //   let access = await ctx.service.group.acceptGroupInvite({ invite_id: user1.id , current_user:user2.id ,accept:true})

  //   assert(inviteUserIn.group_id === access);
  // });

});
