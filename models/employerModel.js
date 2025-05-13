const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
    },
    profilePhoto: { type: Buffer,
    },
    companyDescription: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        validate: {
            validator: (v) => /^\d{10}$/.test(v),
            message: props => `${props.value} is not a valid phone number!`
        },
    },
    password: {
        type: String,
        required: true,
    },
    companyLocation: {
        type: String, // E.g., "New York", "San Francisco"
        required: true,
    },
    industry: {
        type: String, // E.g., "IT", "Healthcare"
        required: true,
    },
    companySize: {
        type: String,
        enum: ["Small", "Medium", "Large"],
        required: true,
    },
    socialLinks: {
        linkedin: { type: String, validate: /^https:\/\/(www\.)?linkedin\.com\/.+$/ },
        twitter: { type: String, validate: /^https:\/\/(www\.)?twitter\.com\/.+$/ },
        website: { type: String },
    },
    jobsPosted: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'job', // Reference to the Job schema
        },
    ],
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('employer', employerSchema);
