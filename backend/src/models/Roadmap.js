/**
 * Roadmap.js  —  Mongoose model
 * Stores an AI-generated, personalized learning roadmap for one user.
 */
const mongoose = require('mongoose');

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const topicSchema = new mongoose.Schema(
  { name: String, completed: { type: Boolean, default: false }, duration: String },
  { _id: false }
);

const resourceSchema = new mongoose.Schema(
  { title: String, url: String, type: { type: String, enum: ['video', 'article', 'course', 'book', 'practice'] } },
  { _id: false }
);

const milestoneSchema = new mongoose.Schema(
  {
    id:           { type: Number, required: true },
    title:        { type: String, required: true },
    subtitle:     String,
    color:        { type: String, default: '#4f46e5' },
    durationWeeks:{ type: Number, default: 4 },
    status:       { type: String, enum: ['completed', 'current', 'locked'], default: 'locked' },
    progress:     { type: Number, default: 0, min: 0, max: 100 },
    // Position on the scenic map canvas (percentage 0-100)
    position:     { x: { type: Number, default: 50 }, y: { type: Number, default: 50 } },
    topics:       [topicSchema],
    resources:    [resourceSchema]
  },
  { _id: false }
);

const dailySessionSchema = new mongoose.Schema(
  {
    id:      Number,
    time:    String,          // e.g. "09:00 - 10:00 AM"
    title:   String,
    details: [String],
    status:  { type: String, enum: ['completed', 'current', 'locked'], default: 'locked' },
    icon:    { type: String, default: 'Code' }, // lucide icon name
    color:   { type: String, default: '#3b82f6' }
  },
  { _id: false }
);

const statsSchema = new mongoose.Schema(
  {
    totalWeeks:          Number,
    completedMilestones: { type: Number, default: 0 },
    xpScore:             { type: Number, default: 0 },
    progressPercent:     { type: Number, default: 0, min: 0, max: 100 },
    currentDay:          { type: Number, default: 1 },
    totalDays:           Number,
    daysLeft:            Number
  },
  { _id: false }
);

// ─── Main Schema ─────────────────────────────────────────────────────────────

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
      index: true
    },
    domain:       { type: String, required: true },
    displayName:  { type: String, default: '' },
    profile:      { type: Object, default: {} },   // snapshot of questionnaire answers
    milestones:   [milestoneSchema],
    dailySessions:[dailySessionSchema],
    stats:        { type: statsSchema, default: () => ({}) },
    status:       { type: String, enum: ['active', 'completed'], default: 'active' }
  },
  { timestamps: true }
);

// Only one active roadmap per user
roadmapSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Roadmap', roadmapSchema);
