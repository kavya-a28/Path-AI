const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['assistant', 'user'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  extractedFields: { type: Object, default: {} }
});

const fieldDataSchema = new mongoose.Schema({
  value: { type: mongoose.Schema.Types.Mixed, default: null },
  confidence: { type: Number, default: 0, min: 0, max: 1 }
}, { _id: false });

const onboardingSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  messages: [messageSchema],
  extractedProfile: {
    currentYear: { type: fieldDataSchema, default: () => ({}) },
    primaryGoal: { type: fieldDataSchema, default: () => ({}) },
    preferredDomain: { type: fieldDataSchema, default: () => ({}) },
    preferredLanguage: { type: fieldDataSchema, default: () => ({}) },
    dsaLevel: { type: fieldDataSchema, default: () => ({}) },
    studyHoursPerDay: { type: fieldDataSchema, default: () => ({}) },
    consistencyLevel: { type: fieldDataSchema, default: () => ({}) },
    learningStyle: { type: fieldDataSchema, default: () => ({}) },
    currentSkills: { type: fieldDataSchema, default: () => ({}) },
    targetCompanies: { type: fieldDataSchema, default: () => ({}) },
    timeline: { type: fieldDataSchema, default: () => ({}) },
    projectExperience: { type: fieldDataSchema, default: () => ({}) },
    frameworkExperience: { type: fieldDataSchema, default: () => ({}) },
    mathFoundation: { type: fieldDataSchema, default: () => ({}) },
    motivation: { type: fieldDataSchema, default: () => ({}) },
    algorithmicCore: { type: fieldDataSchema, default: () => ({}) },
    stackFocus: { type: fieldDataSchema, default: () => ({}) },
    existingBaseline: { type: fieldDataSchema, default: () => ({}) },
    timeCommitment: { type: fieldDataSchema, default: () => ({}) },
    targetDuration: { type: fieldDataSchema, default: () => ({}) }
  },
  topicsCovered: [String],
  turnCount: {
    type: Number,
    default: 0
  },
  maxTurns: {
    type: Number,
    default: 20
  },
  queueGenerated: {
    type: Boolean,
    default: false
  },
  questionQueue: {
    type: Array,
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OnboardingSession', onboardingSessionSchema);
