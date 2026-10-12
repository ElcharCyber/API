const UsersHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'users',
  version: '1.0.0',
  register: (app, { service, validator, cacheService }) => {
    const usersHandler = new UsersHandler(service, validator, cacheService);
    app.use('/users', routes(usersHandler));
  },
};
