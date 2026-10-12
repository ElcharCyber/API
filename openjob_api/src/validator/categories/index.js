const InvariantError = require('../../exceptions/InvariantError');
const { CategoryPayloadSchema } = require('./schema');

const CategoriesValidator = {
  validateCategoryPayload: (payload) => {
    const { error } = CategoryPayloadSchema.validate(payload);
    if (error) {
      throw new InvariantError(error.message);
    }
  },
};

module.exports = CategoriesValidator;
