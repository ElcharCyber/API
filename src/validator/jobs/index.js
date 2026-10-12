const InvariantError = require('../../exceptions/InvariantError');
const { JobPayloadSchema } = require('./schema');

const JobsValidator = {
  validateJobPayload: (payload) => {
    const { error } = JobPayloadSchema.validate(payload);
    if (error) {
      throw new InvariantError(error.message);
    }
  },
};

module.exports = JobsValidator;
