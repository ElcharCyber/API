const express = require('express');
const authMiddleware = require('../../middlewares/auth');

const routes = (handler) => {
  const router = express.Router();

  router.post(
    '/',
    authMiddleware,
    handler.getUploadMiddleware(),
    (req, res, next) => handler.postDocumentHandler(req, res, next)
  );

  router.get('/', (req, res, next) => handler.getDocumentsHandler(req, res, next));
  router.get('/:id', (req, res, next) => handler.getDocumentByIdHandler(req, res, next));
  router.delete('/:id', authMiddleware, (req, res, next) =>
    handler.deleteDocumentByIdHandler(req, res, next)
  );

  return router;
};

module.exports = routes;
