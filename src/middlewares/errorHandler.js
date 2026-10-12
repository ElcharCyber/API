const ClientError = require('../exceptions/ClientError');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: 'failed',
      message: err.message,
    });
  }

  // Handle PostgreSQL duplicate key constraint violation (23505)
  if (err.code === '23505') {
    return res.status(400).json({
      status: 'failed',
      message: 'Email atau data unik sudah digunakan',
    });
  }

  // Handle PostgreSQL foreign key violation (23503)
  if (err.code === '23503') {
    return res.status(400).json({
      status: 'failed',
      message: 'Resource yang direferensikan tidak ditemukan',
    });
  }

  // Unhandled server error
  console.error('SERVER ERROR:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Terjadi kegagalan pada server kami',
  });
};

module.exports = errorHandler;
