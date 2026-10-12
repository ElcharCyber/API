const AuthenticationError = require('../exceptions/AuthenticationError');
const TokenManager = require('../tokenize/TokenManager');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AuthenticationError('Kredensial autentikasi tidak ditemukan');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AuthenticationError('Format token tidak valid');
  }

  const token = parts[1];

  try {
    const decoded = TokenManager.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AuthenticationError('Token tidak valid atau kedaluwarsa');
  }
};

module.exports = authMiddleware;
