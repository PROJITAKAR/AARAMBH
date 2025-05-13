const Joi = require('joi');

// Define the Joi schema
const employerLoginSchema = Joi.object({
  
  email: Joi.string()
          .email()
          .required()
          .messages({
              'string.base': 'Email should be a string.',
              'string.email': 'Please provide a valid email address.',
              'any.required': 'Email is required.'
    }),

  password: Joi.string()
          .min(4)
          .required()
          .messages({
              'string.base': 'Password should be a string.',
              'string.min': 'Password must be at least 4 characters long.',
              'any.required': 'Password is required.'
    }),
});

// Export the schema
module.exports = employerLoginSchema;
