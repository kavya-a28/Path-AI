const mongoose = require('mongoose');

// Schema for individual options within a question
const OptionSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true 
  },
  next_question_id: { 
    type: String, 
    required: true // Points to the next question ID or a final milestone like 'generate_roadmap_...'
  }
}, { _id: false }); // Prevents mongoose from creating an extra _id field for every option

// Schema for a single question block
const QuestionBlockSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['multiple_choice', 'text'], 
    default: 'multiple_choice' 
  },
  options: [OptionSchema] // Array of choices for the user
}, { _id: false });

// The main Schema for the entire domain tree
const QuestionTreeSchema = new mongoose.Schema({
  domain: { 
    type: String, 
    required: true, 
    unique: true // Example: 'web_development', 'dsa', 'cybersecurity'
  },
  version: { 
    type: Number, 
    default: 1.0 
  },
  entry_question_id: { 
    type: String, 
    required: true // Tell the app where to start (e.g., 'web_01')
  },
  // This stores all questions as key-value pairs (an object)
  questions: {
    type: Map,
    of: QuestionBlockSchema,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('QuestionTree', QuestionTreeSchema);