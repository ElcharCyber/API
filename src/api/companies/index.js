const CompaniesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'companies',
  version: '1.0.0',
  register: (app, { service, validator, cacheService }) => {
    const companiesHandler = new CompaniesHandler(service, validator, cacheService);
    app.use('/companies', routes(companiesHandler));
  },
};
