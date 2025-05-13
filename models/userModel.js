const mongoose= require('mongoose');

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim: true,
    },
    profilePhoto: { type: Buffer,
    },
    email:{
        type:String,
        required: true,
        unique: true,
    },
    phone:{
        type:String,
        validate: {
            validator: (v) => /^\d{10}$/.test(v), // Validates 10-digit numbers
            message: props => `${props.value} is not a valid phone number!`
        },
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    disability:{
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
        type: [String],
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
    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'skill',
        required: true,
    }],
    preferredJobType: { 
        type: String, // e.g., "Remote", "Full-time"
        enum: ["Remote", "Full-time", "Part-time", "Contract"],
        required: true,
      },
    preferredLocation: { 
        type: String ,// e.g., "Remote", "New York"
        required: true,
    },
    salaryExpectation: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
    },
    savedJobs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'job',
        },
    ],
    applications:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'application',
    }],
    notifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'notification', // Reference to Notification Schema
    }]
},{
    timestamps: true // Automatically adds createdAt and updatedAt
});
    


module.exports= mongoose.model('user', userSchema);