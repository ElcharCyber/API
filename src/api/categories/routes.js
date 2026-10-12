const express = require('express');
const authMiddleware = require('../../middlewares/auth');

const routes = (handler) => {
  const router = express.Router();

  router.get('/', (req, res, next) => handler.getCategoriesHandler(req, res, next));
  router.get('/:id', (req, res, next) => handler.getCategoryByIdHandler(req, res, next));
  router.post('/', authMiddleware, (req, res, next) => handler.postCategoryHandler(req, res, next));
  router.put('/:id', authMiddleware, (req, res, next) => handler.putCategoryByIdHandler(req, res, next));
  router.delete('/:id', authMiddleware, (req, res, next) => handler.deleteCategoryByIdHandler(req, res, next));

  return router;
};

module.exports = routes;
