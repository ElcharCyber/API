const BookmarksHandler = require('./handler');
const { jobBookmarkRoutes, bookmarksRoutes } = require('./routes');

module.exports = {
  name: 'bookmarks',
  version: '2.0.0',
  register: (app, { service, cacheService }) => {
    const bookmarksHandler = new BookmarksHandler(service, cacheService);
    app.use('/jobs/:jobId/bookmark', jobBookmarkRoutes(bookmarksHandler));
    app.use('/bookmarks', bookmarksRoutes(bookmarksHandler));
  },
};
