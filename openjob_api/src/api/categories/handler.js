class CategoriesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postCategoryHandler(req, res, next) {
    try {
      this._validator.validateCategoryPayload(req.body);
      const categoryId = await this._service.addCategory(req.body);

      return res.status(201).json({
        status: 'success',
        data: {
          id: categoryId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoriesHandler(req, res, next) {
    try {
      const categories = await this._service.getCategories();

      return res.status(200).json({
        status: 'success',
        data: {
          categories,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const category = await this._service.getCategoryById(id);

      return res.status(200).json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async putCategoryByIdHandler(req, res, next) {
    try {
      this._validator.validateCategoryPayload(req.body);
      const { id } = req.params;
      await this._service.editCategoryById(id, req.body);

      return res.status(200).json({
        status: 'success',
        message: 'Category berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategoryByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteCategoryById(id);

      return res.status(200).json({
        status: 'success',
        message: 'Category berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoriesHandler;
