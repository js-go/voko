'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/users.test.js', () => {

  it('should return 201 created.', async function () {
    const ctx = app.mockContext();
    const mock = {
      phone: '18899999999',
      password: ctx.helper.bhash('pass'),
      username: 'test'
    }
    await app.httpRequest()
      .post('/user/register')
      .send(mock)
      .expect(201)
      .then(response => {
        console.log(response)
    })
  });


});
