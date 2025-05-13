const Joi = require('joi');

// Define the Joi schema
const userRegistrationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Name is required",
    }),


  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),

  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone number must be a 10-digit number",
    }),

  password: Joi.string()
    .min(4)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 4 characters long",
    }),

  disability: Joi.array()
    .items(
        Joi.string().valid(
            "Visual Impairment",
            "Hearing Impairment",
            "Cognitive Impairment",
            "Physical Disability",
            "None"
        )
    )
    .min(1)
    .required()
    .messages({
        "array.includes": "Invalid disability type",
        "array.min": "At least one disability type is required",
        "any.required": "Disability is required"
    }),

  accessibilityFeatures: Joi.array()
    .items(
        Joi.string().valid(
            "Wheelchair Access",
            "Braille Signage",
            "Elevator Access",
            "Ramp Access",
            "Adjustable Desks",
            "Accessible Restrooms",
            "Accessible Parking"
        )
    )
    .min(1)
    .required()
    .messages({
        "array.includes": "Invalid accessibility feature",
        "array.min": "At least one accessibility feature is required",
        "any.required": "Accessibility features are required"
    }),

  skills: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
        "array.min": "At least one skill is required",
        "any.required": "Skills are required"
    }),

  preferredJobType: Joi.string()
    .valid("Remote", "Full-time", "Part-time", "Contract")
    .required()
    .messages({
      "string.empty": "Preferred job type is required",
      "any.only": "Invalid job type",
    }),

  preferredLocation: Joi.string()
    .required()
    .messages({
      "string.empty": "Preferred location is required",
    }),

  salaryExpectation: Joi.object({
    min: Joi.number()
      .min(0)
      .required()
      .messages({
        "number.base": "Minimum salary expectation must be a number",
        "number.min": "Minimum salary must be at least 0",
      }),
    max: Joi.number()
      .greater(Joi.ref("min"))
      .required()
      .messages({
        "number.base": "Maximum salary expectation must be a number",
        "number.greater": "Maximum salary must be greater than minimum salary",
      }),
  }).required(),

});

// Export the schema
module.exports = userRegistrationSchema;
