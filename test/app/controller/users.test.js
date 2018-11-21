'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/users.test.js', () => {

  const mock = {
    phone: '18899999999',
    password: 'test',
    username: 'test'
  }

  it('should return 201 created.', async function () {
    await app.httpRequest()
      .post('/user/register')
      .send(mock)
      .expect(201)
      .then((response) => {
        assert(response.body.status == 201)
      })
  });

  it('should return 500 error, phone has been used', async function () {
    await app.httpRequest()
      .post('/user/register')
      .send(mock)
      .expect(500)
      .expect({
        status: 500,
        message: 'phone has been used.'
      })
  });


});
