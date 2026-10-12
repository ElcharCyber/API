const Joi = require('joi');

const PostApplicationPayloadSchema = Joi.object({
  job_id: Joi.string().required(),
  user_id: Joi.string().allow('', null),
  status: Joi.string().allow('', null),
});

const PutApplicationStatusPayloadSchema = Joi.object({
  status: Joi.string().required(),
});

module.exports = {
  PostApplicationPayloadSchema,
  PutApplicationStatusPayloadSchema,
};
