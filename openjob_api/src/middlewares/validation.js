const InvariantError = require('../exceptions/InvariantError');

const validatePayload = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      throw new InvariantError(error.message);
    }
    req[property] = value;
    next();
  };
};

module.exports = validatePayload;
