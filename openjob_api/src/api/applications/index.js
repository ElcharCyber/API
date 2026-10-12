const ApplicationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'applications',
  version: '2.0.0',
  register: (app, { service, validator, cacheService, producerService }) => {
    const applicationsHandler = new ApplicationsHandler(
      service,
      validator,
      cacheService,
      producerService
    );
    app.use('/applications', routes(applicationsHandler));
  },
};
