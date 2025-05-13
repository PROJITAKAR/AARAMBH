const Joi = require('joi');

const createApplicationSchema = Joi.object({
    job: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/) // Validate MongoDB ObjectId format
        .messages({
            'any.required': 'Something went wrong. Please try again.',
            'string.pattern.base': 'Something went wrong. Please try again.',
        }),
    additionalInformation: Joi.string().optional().allow(''),
});

const editApplicationSchema = Joi.object({
  additionalInformation: Joi.string().optional().allow(''),
});


const updateApplicationSchema = Joi.object({ 
  applicationId: Joi.string().hex().length(24).required().messages({
    'string.base': 'System error. Please try again later.',
    'string.hex': 'System error. Please try again later.',
    'string.length': 'System error. Please try again later.',
    'any.required': 'System error. Please try again later.',
  }),
  feedback: Joi.string().optional().allow('').messages({
    'string.base': 'Feedback must be a string',
  }),
  status: Joi.string().valid('accepted', 'rejected', 'reviewed').required().messages({
    'string.base': 'Status must be a string',
    'any.only': 'Status must be either "accepted", "rejected", or "pending"',
    'any.required': 'Status is required',
  })
});


module.exports= {createApplicationSchema, updateApplicationSchema,editApplicationSchema};
