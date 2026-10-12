const express = require('express');
const authMiddleware = require('../../middlewares/auth');

const routes = (handler) => {
  const router = express.Router();

  router.get('/', (req, res, next) => handler.getCompaniesHandler(req, res, next));
  router.get('/:id', (req, res, next) => handler.getCompanyByIdHandler(req, res, next));
  router.post('/', authMiddleware, (req, res, next) => handler.postCompanyHandler(req, res, next));
  router.put('/:id', authMiddleware, (req, res, next) => handler.putCompanyByIdHandler(req, res, next));
  router.delete('/:id', authMiddleware, (req, res, next) => handler.deleteCompanyByIdHandler(req, res, next));

  return router;
};

module.exports = routes;
