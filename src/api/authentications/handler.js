class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
  }

  async postAuthenticationHandler(req, res, next) {
    try {
      this._validator.validatePostAuthenticationPayload(req.body);

      const { email, password } = req.body;
      const id = await this._usersService.verifyUserCredential(email, password);

      const accessToken = this._tokenManager.generateAccessToken({ id });
      const refreshToken = this._tokenManager.generateRefreshToken({ id });

      await this._authenticationsService.addRefreshToken(refreshToken);

      return res.status(200).json({
        status: 'success',
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async putAuthenticationHandler(req, res, next) {
    try {
      this._validator.validatePutAuthenticationPayload(req.body);

      const { refreshToken } = req.body;
      const decoded = this._tokenManager.verifyRefreshToken(refreshToken);
      await this._authenticationsService.verifyRefreshToken(refreshToken);

      const accessToken = this._tokenManager.generateAccessToken({ id: decoded.id });

      return res.status(200).json({
        status: 'success',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAuthenticationHandler(req, res, next) {
    try {
      this._validator.validateDeleteAuthenticationPayload(req.body);

      const { refreshToken } = req.body;
      await this._authenticationsService.deleteRefreshToken(refreshToken);

      return res.status(200).json({
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthenticationsHandler;
