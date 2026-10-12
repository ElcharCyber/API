class CompaniesHandler {
  constructor(service, validator, cacheService) {
    this._service = service;
    this._validator = validator;
    this._cacheService = cacheService;
  }

  async postCompanyHandler(req, res, next) {
    try {
      this._validator.validateCompanyPayload(req.body);
      const ownerId = req.user?.id || null;
      const companyId = await this._service.addCompany({
        ...req.body,
        owner_id: ownerId,
      });

      return res.status(201).json({
        status: 'success',
        data: {
          id: companyId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompaniesHandler(req, res, next) {
    try {
      const companies = await this._service.getCompanies();

      return res.status(200).json({
        status: 'success',
        data: {
          companies,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompanyByIdHandler(req, res, next) {
    try {
      const { id } = req.params;

      if (this._cacheService) {
        const cachedCompany = await this._cacheService.get(`companies:${id}`);
        if (cachedCompany) {
          res.set('X-Data-Source', 'cache');
          return res.status(200).json({
            status: 'success',
            data: cachedCompany,
          });
        }
      }

      const company = await this._service.getCompanyById(id);

      if (this._cacheService) {
        await this._cacheService.set(`companies:${id}`, company, 3600);
      }
      res.set('X-Data-Source', 'database');

      return res.status(200).json({
        status: 'success',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }

  async putCompanyByIdHandler(req, res, next) {
    try {
      this._validator.validateCompanyPayload(req.body);
      const { id } = req.params;
      await this._service.editCompanyById(id, req.body);

      if (this._cacheService) {
        await this._cacheService.delete(`companies:${id}`);
      }

      return res.status(200).json({
        status: 'success',
        message: 'Company berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCompanyByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteCompanyById(id);

      if (this._cacheService) {
        await this._cacheService.delete(`companies:${id}`);
      }

      return res.status(200).json({
        status: 'success',
        message: 'Company berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CompaniesHandler;
