class JobsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postJobHandler(req, res, next) {
    try {
      this._validator.validateJobPayload(req.body);
      const ownerId = req.user?.id || null;
      const jobId = await this._service.addJob({
        ...req.body,
        owner_id: ownerId,
      });

      return res.status(201).json({
        status: 'success',
        data: {
          id: jobId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobsHandler(req, res, next) {
    try {
      const { title } = req.query;
      const companyName = req.query['company-name'];

      const jobs = await this._service.getJobs({ title, companyName });

      return res.status(200).json({
        status: 'success',
        data: {
          jobs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobsByCompanyIdHandler(req, res, next) {
    try {
      const { companyId } = req.params;
      const jobs = await this._service.getJobsByCompanyId(companyId);

      return res.status(200).json({
        status: 'success',
        data: {
          jobs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobsByCategoryIdHandler(req, res, next) {
    try {
      const { categoryId } = req.params;
      const jobs = await this._service.getJobsByCategoryId(categoryId);

      return res.status(200).json({
        status: 'success',
        data: {
          jobs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const job = await this._service.getJobById(id);

      return res.status(200).json({
        status: 'success',
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  async putJobByIdHandler(req, res, next) {
    try {
      this._validator.validateJobPayload(req.body);
      const { id } = req.params;
      await this._service.editJobById(id, req.body);

      return res.status(200).json({
        status: 'success',
        message: 'Job berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteJobByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      await this._service.deleteJobById(id);

      return res.status(200).json({
        status: 'success',
        message: 'Job berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = JobsHandler;
