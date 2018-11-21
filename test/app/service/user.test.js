'use strict'

const { app, assert } = require('egg-mock/bootstrap')

describe('test/app/service/user.test.js', () => {
  let ctx

  before(() => {
    ctx = app.mockContext()
  })

  it('generate token', () => {
    const payload = { id: 1 }
    const token = ctx.service.user.generateAccessToken(payload)

    assert(token !== null)
    assert(token !== undefined)
    assert(token !== '')

    const decode = ctx.service.user.verifyToken(token)

    assert(decode.id === payload.id)
  })
})
