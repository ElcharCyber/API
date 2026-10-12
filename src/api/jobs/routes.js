const express = require('express');
const authMiddleware = require('../../middlewares/auth');

const routes = (handler) => {
  const router = express.Router();

  router.get('/', (req, res, next) => handler.getJobsHandler(req, res, next));
  router.get('/company/:companyId', (req, res, next) => handler.getJobsByCompanyIdHandler(req, res, next));
  router.get('/category/:categoryId', (req, res, next) => handler.getJobsByCategoryIdHandler(req, res, next));
  router.get('/:id', (req, res, next) => handler.getJobByIdHandler(req, res, next));
  router.post('/', authMiddleware, (req, res, next) => handler.postJobHandler(req, res, next));
  router.put('/:id', authMiddleware, (req, res, next) => handler.putJobByIdHandler(req, res, next));
  router.delete('/:id', authMiddleware, (req, res, next) => handler.deleteJobByIdHandler(req, res, next));

  return router;
};

module.exports = routes;
