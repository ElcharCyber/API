const CategoriesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'categories',
  version: '1.0.0',
  register: (app, { service, validator }) => {
    const categoriesHandler = new CategoriesHandler(service, validator);
    app.use('/categories', routes(categoriesHandler));
  },
};
