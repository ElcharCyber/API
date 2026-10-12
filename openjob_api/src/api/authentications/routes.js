const express = require('express');
const authMiddleware = require('../../middlewares/auth');

const routes = (handler) => {
  const router = express.Router();

  router.post('/', (req, res, next) => handler.postAuthenticationHandler(req, res, next));
  router.put('/', (req, res, next) => handler.putAuthenticationHandler(req, res, next));
  router.delete('/', authMiddleware, (req, res, next) => handler.deleteAuthenticationHandler(req, res, next));

  return router;
};

module.exports = routes;
