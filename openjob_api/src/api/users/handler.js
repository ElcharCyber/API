class UsersHandler {
  constructor(service, validator, cacheService) {
    this._service = service;
    this._validator = validator;
    this._cacheService = cacheService;
  }

  async postUserHandler(req, res, next) {
    try {
      this._validator.validateUserPayload(req.body);
      const userId = await this._service.addUser(req.body);

      return res.status(201).json({
        status: 'success',
        data: {
          id: userId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserByIdHandler(req, res, next) {
    try {
      const { id } = req.params;

      if (this._cacheService) {
        const cachedUser = await this._cacheService.get(`users:${id}`);
        if (cachedUser) {
          res.set('X-Data-Source', 'cache');
          return res.status(200).json({
            status: 'success',
            data: cachedUser,
          });
        }
      }

      const user = await this._service.getUserById(id);

      if (this._cacheService) {
        await this._cacheService.set(`users:${id}`, user, 3600);
      }
      res.set('X-Data-Source', 'database');

      return res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersHandler;
