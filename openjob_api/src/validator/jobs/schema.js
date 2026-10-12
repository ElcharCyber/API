const Joi = require('joi');

const JobPayloadSchema = Joi.object({
  title: Joi.string().required(),
  company_id: Joi.string().required(),
  category_id: Joi.string().required(),
  description: Joi.string().allow('', null),
  job_type: Joi.string().allow('', null),
  experience_level: Joi.string().allow('', null),
  location_type: Joi.string().allow('', null),
  location_city: Joi.string().allow('', null),
  salary_min: Joi.number().allow(null),
  salary_max: Joi.number().allow(null),
  is_salary_visible: Joi.boolean().allow(null),
  status: Joi.string().allow('', null),
});

module.exports = { JobPayloadSchema };
