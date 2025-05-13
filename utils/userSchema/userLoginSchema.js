const Joi = require('joi');

// Define the Joi schema
const userLoginSchema = Joi.object({
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),

  password: Joi.string()
    .min(4)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 4 characters long",
    }),
});

// Export the schema
module.exports = userLoginSchema;
