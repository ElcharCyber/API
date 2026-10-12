const express = require('express');
const authMiddleware = require('../../middlewares/auth');

const jobBookmarkRoutes = (handler) => {
  const router = express.Router({ mergeParams: true });

  router.use(authMiddleware);

  router.post('/', (req, res, next) => handler.postBookmarkHandler(req, res, next));
  router.get('/:id', (req, res, next) => handler.getBookmarkByIdHandler(req, res, next));
  router.delete('/', (req, res, next) => handler.deleteBookmarkHandler(req, res, next));

  return router;
};

const bookmarksRoutes = (handler) => {
  const router = express.Router();

  router.use(authMiddleware);

  router.get('/', (req, res, next) => handler.getBookmarksHandler(req, res, next));

  return router;
};

module.exports = { jobBookmarkRoutes, bookmarksRoutes };
