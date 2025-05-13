const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'job',
        required: true,
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'accepted', 'rejected'],
        default: 'pending',
    },
    feedback: {
        type: String, // Optional field for feedback from the employer
    },
    resume:{
        type: Buffer,
        required: true,
    },
    additionalInformation: {
        type: String, // Optional field for additional information from the applicant
    },
    acceptedAt: {
        type: Date,
    },
    rejectedAt: {
        type: Date,
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('application', applicationSchema);
