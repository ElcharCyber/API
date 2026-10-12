const ProfileHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'profile',
  version: '1.0.0',
  register: (app, { usersService, applicationsService, bookmarksService }) => {
    const profileHandler = new ProfileHandler(
      usersService,
      applicationsService,
      bookmarksService
    );
    app.use('/profile', routes(profileHandler));
  },
};
