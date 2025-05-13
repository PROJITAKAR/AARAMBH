const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensures that the skill name is unique in the database
    trim: true,   // Removes any extra spaces
  },
});

module.exports = mongoose.model('skill', skillSchema);
