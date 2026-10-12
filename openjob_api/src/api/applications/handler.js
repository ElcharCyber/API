class ApplicationsHandler {
  constructor(service, validator, cacheService, producerService) {
    this._service = service;
    this._validator = validator;
    this._cacheService = cacheService;
    this._producerService = producerService;
  }

  async postApplicationHandler(req, res, next) {
    try {
      this._validator.validatePostApplicationPayload(req.body);

      const userId = req.body.user_id || req.user.id;
      const { job_id: jobId, status } = req.body;

      const application = await this._service.addApplication({
        userId,
        jobId,
        status: status || 'pending',
      });

      // Invalidate list caches for user and job
      if (this._cacheService) {
        await Promise.all([
          this._cacheService.delete(`applications:user:${userId}`),
          this._cacheService.delete(`applications:job:${jobId}`),
        ]);
      }

      // Publish to RabbitMQ asynchronously without blocking response
      if (this._producerService) {
        this._producerService
          .sendMessage('applications:queue', JSON.stringify({ application_id: application.id }))
          .catch((err) => {
            console.error('RabbitMQ async publish error:', err.message);
          });
      }

      return res.status(201).json({
        status: 'success',
        data: {
          id: application.id,
          user_id: application.user_id,
          job_id: application.job_id,
          status: application.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getApplicationsHandler(req, res, next) {
    try {
      const applications = await this._service.getApplications();

      return res.status(200).json({
        status: 'success',
        data: {
          applications,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getApplicationsByUserIdHandler(req, res, next) {
    try {
      const { userId } = req.params;

      if (this._cacheService) {
        const cached = await this._cacheService.get(`applications:user:${userId}`);
        if (cached) {
          res.set('X-Data-Source', 'cache');
          return res.status(200).json({
            status: 'success',
            data: {
              applications: cached,
            },
          });
        }
      }

      const applications = await this._service.getApplicationsByUserId(userId);

      if (this._cacheService) {
        await this._cacheService.set(`applications:user:${userId}`, applications, 3600);
      }
      res.set('X-Data-Source', 'database');

      return res.status(200).json({
        status: 'success',
        data: {
          applications,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getApplicationsByJobIdHandler(req, res, next) {
    try {
      const { jobId } = req.params;

      if (this._cacheService) {
        const cached = await this._cacheService.get(`applications:job:${jobId}`);
        if (cached) {
          res.set('X-Data-Source', 'cache');
          return res.status(200).json({
            status: 'success',
            data: {
              applications: cached,
            },
          });
        }
      }

      const applications = await this._service.getApplicationsByJobId(jobId);

      if (this._cacheService) {
        await this._cacheService.set(`applications:job:${jobId}`, applications, 3600);
      }
      res.set('X-Data-Source', 'database');

      return res.status(200).json({
        status: 'success',
        data: {
          applications,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getApplicationByIdHandler(req, res, next) {
    try {
      const { id } = req.params;

      if (this._cacheService) {
        const cached = await this._cacheService.get(`applications:${id}`);
        if (cached) {
          res.set('X-Data-Source', 'cache');
          return res.status(200).json({
            status: 'success',
            data: cached,
          });
        }
      }

      const application = await this._service.getApplicationById(id);

      if (this._cacheService) {
        await this._cacheService.set(`applications:${id}`, application, 3600);
      }
      res.set('X-Data-Source', 'database');

      return res.status(200).json({
        status: 'success',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  async putApplicationStatusByIdHandler(req, res, next) {
    try {
      this._validator.validatePutApplicationStatusPayload(req.body);

      const { id } = req.params;
      const { status } = req.body;

      const updated = await this._service.editApplicationStatusById(id, status);

      if (this._cacheService) {
        await Promise.all([
          this._cacheService.delete(`applications:${id}`),
          this._cacheService.delete(`applications:user:${updated.user_id}`),
          this._cacheService.delete(`applications:job:${updated.job_id}`),
        ]);
      }

      return res.status(200).json({
        status: 'success',
        message: 'Status lamaran berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteApplicationByIdHandler(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await this._service.deleteApplicationById(id);

      if (this._cacheService) {
        await Promise.all([
          this._cacheService.delete(`applications:${id}`),
          this._cacheService.delete(`applications:user:${deleted.user_id}`),
          this._cacheService.delete(`applications:job:${deleted.job_id}`),
        ]);
      }

      return res.status(200).json({
        status: 'success',
        message: 'Lamaran berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ApplicationsHandler;
