const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String, 
        required: true,
    },
    jobType:{
        type:String,
        enum: ["Full-time", "Part-time", "Remote","Contract"],
        required: true,
    },
    disabilityAccepted:{
        type: [String],
        enum: [
            "Visual Impairment",
            "Hearing Impairment",
            "Cognitive Impairment",
            "Physical Disability",
            "None",
        ],
        default: ["None"],
        required: true,
    },
    accessibilityFeatures: {
        type: [String], // Predefined accessibility features (e.g., "Wheelchair Access", "Remote Work")
        enum: [
            "Wheelchair Access",
            "Braille Signage",
            "Elevator Access",
            "Ramp Access",
            "Adjustable Desks",
            "Accessible Restrooms",
            "Accessible Parking"
        ],
        required: true,
    },
    skillsRequired: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'skill',
            required: true,
    }],
    totalVacancy:{
        type:Number,
        min: 1,
    },
    salaryRange: {
        min: { type: Number ,required: true },
        max: { type: Number ,required: true },
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employer', // Reference to the employer who posted the job
    },
    status: {
        type: String,
        enum: ["Open", "Closed"],
        default: "Open",
    },
    deadline: {
        type: Date,
    },
},{
    timestamps: true,
});

module.exports = mongoose.model('job', jobSchema);
