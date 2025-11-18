const Joi = require('joi');

// Validate request body against schema
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req.validatedBody = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    invitationToken: Joi.string().uuid().required()
  }),

  createOrganization: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    slug: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
    description: Joi.string().allow('', null),
    settings: Joi.object().default({})
  }),

  importSettings: Joi.object({
    sendInvitations: Joi.boolean().default(true),
    defaultRole: Joi.string().valid('student', 'instructor').default('student'),
    skipDuplicates: Joi.boolean().default(true)
  }),

  columnMapping: Joi.object({
    email: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    group: Joi.string().allow('', null),
    role: Joi.string().allow('', null)
  })
};

module.exports = {
  validate,
  schemas
};
