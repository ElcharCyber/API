const DocumentsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'documents',
  version: '2.0.0',
  register: (app, { service, validator }) => {
    const documentsHandler = new DocumentsHandler(service, validator);
    app.use('/documents', routes(documentsHandler));
  },
};
