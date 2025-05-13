const Joi = require('joi');

const employerRegistrationSchema = Joi.object({
    companyName: Joi.string()
        .required()
        .messages({
            'string.base': 'Company name should be a string.',
            'any.required': 'Company name is required.'
        }),

    companyDescription: Joi.string()
        .required()
        .messages({
            'string.base': 'Company description should be a string.',
            'any.required': 'Company description is required.'
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.base': 'Email should be a string.',
            'string.email': 'Please provide a valid email address.',
            'any.required': 'Email is required.'
        }),

    phone: Joi.string()
        .pattern(/^\+?\d{10,15}$/)
        .optional()
        .messages({
            'string.base': 'Phone number should be a string.',
            'string.pattern.base': 'Phone number should be a valid phone number (10 digits).',
        }),

    password: Joi.string()
        .min(4)
        .required()
        .messages({
            'string.base': 'Password should be a string.',
            'string.min': 'Password must be at least 4 characters long.',
            'any.required': 'Password is required.'
        }),

    companyLocation: Joi.string()
        .required()
        .messages({
            'string.base': 'Company location should be a string.',
            'any.required': 'Company location is required.'
        }),

    industry: Joi.string()
        .required()
        .messages({
            'string.base': 'Industry should be a string.',
            'any.required': 'Industry is required.'
        }),

    companySize: Joi.string()
        .valid("Small", "Medium", "Large")
        .required()
        .messages({
            'string.base': 'Company size should be a string.',
            'any.only': 'Company size must be one of the following: Small, Medium, Large.',
            'any.required': 'Company size is required.'
        }),

    socialLinks: Joi.object({
        linkedin: Joi.string()
            .uri()
            .pattern(/^https:\/\/(www\.)?linkedin\.com\/.+$/)
            .optional()
            .messages({
                'string.uri': 'Please provide a valid LinkedIn URL.',
                'string.pattern.base': 'LinkedIn URL should follow the pattern https://www.linkedin.com/...',
            }),

        twitter: Joi.string()
            .uri()
            .pattern(/^https:\/\/(www\.)?twitter\.com\/.+$/)
            .optional()
            .messages({
                'string.uri': 'Please provide a valid Twitter URL.',
                'string.pattern.base': 'Twitter URL should follow the pattern https://www.twitter.com/...',
            }),

        website: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Please provide a valid website URL.',
            }),
    }).optional()
});

module.exports = employerRegistrationSchema;
