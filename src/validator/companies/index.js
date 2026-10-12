const InvariantError = require('../../exceptions/InvariantError');
const { CompanyPayloadSchema } = require('./schema');

const CompaniesValidator = {
  validateCompanyPayload: (payload) => {
    const { error } = CompanyPayloadSchema.validate(payload);
    if (error) {
      throw new InvariantError(error.message);
    }
  },
};

module.exports = CompaniesValidator;
