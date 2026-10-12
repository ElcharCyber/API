const express = require('express');
const authMiddleware = require('../../middlewares/auth');

const routes = (handler) => {
  const router = express.Router();

  router.use(authMiddleware);

  router.get('/', (req, res, next) => handler.getProfileHandler(req, res, next));
  router.get('/applications', (req, res, next) => handler.getProfileApplicationsHandler(req, res, next));
  router.get('/bookmarks', (req, res, next) => handler.getProfileBookmarksHandler(req, res, next));

  return router;
};

module.exports = routes;
