const express = require('express');
const authMiddleware = require('../../middlewares/auth');

const routes = (handler) => {
  const router = express.Router();

  // All applications endpoints require authentication
  router.use(authMiddleware);

  router.post('/', (req, res, next) => handler.postApplicationHandler(req, res, next));
  router.get('/', (req, res, next) => handler.getApplicationsHandler(req, res, next));
  router.get('/user/:userId', (req, res, next) => handler.getApplicationsByUserIdHandler(req, res, next));
  router.get('/job/:jobId', (req, res, next) => handler.getApplicationsByJobIdHandler(req, res, next));
  router.get('/:id', (req, res, next) => handler.getApplicationByIdHandler(req, res, next));
  router.put('/:id', (req, res, next) => handler.putApplicationStatusByIdHandler(req, res, next));
  router.delete('/:id', (req, res, next) => handler.deleteApplicationByIdHandler(req, res, next));

  return router;
};

module.exports = routes;
