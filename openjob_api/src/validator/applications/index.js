const InvariantError = require('../../exceptions/InvariantError');
const {
  PostApplicationPayloadSchema,
  PutApplicationStatusPayloadSchema,
} = require('./schema');

const ApplicationsValidator = {
  validatePostApplicationPayload: (payload) => {
    const { error } = PostApplicationPayloadSchema.validate(payload);
    if (error) {
      throw new InvariantError(error.message);
    }
  },
  validatePutApplicationStatusPayload: (payload) => {
    const { error } = PutApplicationStatusPayloadSchema.validate(payload);
    if (error) {
      throw new InvariantError(error.message);
    }
  },
};

module.exports = ApplicationsValidator;
