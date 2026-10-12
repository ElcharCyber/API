require('dotenv').config();
const createApp = require('./app');

const init = () => {
  const app = createApp();

  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 3000;

  app.listen(port, host, () => {
    console.log(`Server berjalan pada http://${host}:${port}`);
  });
};

init();
