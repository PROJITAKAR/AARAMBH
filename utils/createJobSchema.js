const Joi = require('joi');

const jobJoiSchema = Joi.object({
    title: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Title is required.',
        }),

    description: Joi.string()
        .required()
        .messages({
            'string.empty': 'Description is required.',
        }),

    location: Joi.string()
        .required()
        .messages({
            'string.empty': 'Location is required.',
        }),
    

    jobType: Joi.string()
        .valid('Full-time', 'Part-time', 'Remote', 'Contract')
        .required()
        .messages({
            'any.required': 'Job Type is required.',
            'any.only': 'Invalid Job Type. Allowed values are Full-time, Part-time, Remote, Contract.',
        }),
    
    disabilityAccepted: Joi.array()
        .items(
            Joi.string()
                .valid(
                    "Visual Impairment",
                    "Hearing Impairment",
                    "Cognitive Impairment",
                    "Physical Disability",
                    "None"
                )
        )
        .default(["None"])
        .required()
        .messages({
            'any.required': 'DisabilityAccepted is required.',
            'array.includesOnly': 'Invalid value in disabilityAccepted.',
        }),

    accessibilityFeatures: Joi.array()
        .items(
            Joi.string()
                .valid(
                    "Wheelchair Access",
                    "Braille Signage",
                    "Elevator Access",
                    "Ramp Access",
                    "Adjustable Desks",
                    "Accessible Restrooms",
                    "Accessible Parking"
                )
        )
        .required()
        .messages({
            'any.required': 'Accessibility features are required.',
            'array.includesOnly': 'Invalid value in accessibilityFeatures.',
        }),

    skillsRequired: Joi.array()
        .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)) // Valid ObjectId
        .required()
        .messages({
            'array.base': 'SkillsRequired must be an array of valid ObjectIds.',
        }),

    totalVacancy: Joi.number()
        .integer()
        .min(1)
        .optional()
        .messages({
            'number.min': 'Total vacancies must be at least 1.',
        }),

    salaryRange: Joi.object({
        min: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Minimum salary must be a number.',
                'number.positive': 'Minimum salary must be a positive number.',
                'any.required': 'Minimum salary is required.',
            }),
        max: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Maximum salary must be a number.',
                'number.positive': 'Maximum salary must be a positive number.',
                'any.required': 'Maximum salary is required.',
            }),
    }).required()
        .messages({
            'any.required': 'Salary range is required.',
        }),

    postedBy: Joi.string()// Valid ObjectId
        .optional()
        .messages({
            'string.pattern.base': 'PostedBy must be a valid ObjectId.',
        }),

    status: Joi.string()
        .valid("Open", "Closed")
        .default("Open")
        .messages({
            'any.only': 'Status must be either "Open" or "Closed".',
        }),

    deadline: Joi.date()
        .greater('now')
        .required()
        .messages({
            'date.greater': 'Deadline must be a future date.',
            'any.required': 'Deadline is required.',
        }),
});

// Export the schema
module.exports = jobJoiSchema;
