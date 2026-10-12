const JobsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'jobs',
  version: '1.0.0',
  register: (app, { service, validator }) => {
    const jobsHandler = new JobsHandler(service, validator);
    app.use('/jobs', routes(jobsHandler));
  },
};
