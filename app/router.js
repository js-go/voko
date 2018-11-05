'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  const tokenRequired = middleware.tokenRequired();

  router.get('/', controller.home.index);
  router.get('/user/:id', tokenRequired, controller.users.show);
  router.post('/user', controller.users.create);

  router.get('/authCallback', controller.users.authenticate);
  router.post('/authenticate', app.passport.authenticate('local', { successRedirect: '/authCallback' }));
};
