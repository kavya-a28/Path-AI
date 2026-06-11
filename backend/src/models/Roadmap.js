/**
 * Roadmap.js  —  Mongoose model (v2)
 * Stores a logic-engine generated, personalized learning roadmap for one user.
 */
const mongoose = require('mongoose');

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const topicSchema = new mongoose.Schema(
  {
    name:           String,
    topicKey:       String,   // maps to resourceCatalog
    completed:      { type: Boolean, default: false },
    duration:       String,   // e.g. "8h"
    estimatedHours: Number
  },
  { _id: false }
);

const resourceSchema = new mongoose.Schema(
  {
    title:      String,
    url:        String,
    videoId:    String, // YouTube video ID (no full URL stored)
    channel:    String,
    type:       { type: String, enum: ['video', 'article', 'course', 'book', 'practice'] },
    durationMin:Number
  },
  { _id: false }
);

const milestoneSchema = new mongoose.Schema(
  {
    id:             { type: Number, required: true },
    title:          { type: String, required: true },
    subtitle:       String,
    color:          { type: String, default: '#4f46e5' },
    durationWeeks:  { type: Number, default: 4 },
    estimatedHours: Number,
    status:         { type: String, enum: ['completed', 'current', 'locked'], default: 'locked' },
    progress:       { type: Number, default: 0, min: 0, max: 100 },
    position:       { x: { type: Number, default: 50 }, y: { type: Number, default: 50 } },
    topics:         [topicSchema],
    resources:      [resourceSchema],
    domain:         String
  },
  { _id: false }
);

const dailySessionSchema = new mongoose.Schema(
  {
    id:             Number,
    day:            Number,       // calendar day number (1, 2, 3, ...)
    time:           String,       // e.g. "9:00 AM - 10:00 AM"
    title:          String,       // topic name
    topicKey:       String,       // maps to resourceCatalog
    topicPart:      String,       // e.g. "50h" (estimated duration)
    totalParts:     Number,
    estimatedHours: Number,
    domain:         String,
    phaseId:        Number,
    phaseTitle:     String,
    details:        [String],
    // Status flow: locked → current (start) → completed | missed (auto)
    status:         { type: String, enum: ['completed', 'current', 'locked', 'missed'], default: 'locked' },
    completedAt:    { type: Date, default: null },  // set when status → completed
    icon:           { type: String, default: 'Code' },
    color:          { type: String, default: '#3b82f6' },
    // Video resource (ID only – never a hallucinated URL)
    videoId:        String,
    embedUrl:       String,
    watchUrl:       String,
    resources:      [resourceSchema]
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
    daysLeft:            Number,
    totalSessions:       Number,
    hoursPerDay:         Number
  },
  { _id: false }
);

// ─── Main Schema ─────────────────────────────────────────────────────────────

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true
    },
    domain:        { type: String, required: true },
    domains:       [String],          // multi-domain support
    displayName:   { type: String, default: '' },
    profile:       { type: Object, default: {} },
    milestones:    [milestoneSchema],
    dailySessions: [dailySessionSchema],
    stats:         { type: statsSchema, default: () => ({}) },
    status:        { type: String, enum: ['active', 'completed'], default: 'active' },
    generatedBy:   { type: String, default: 'logic-engine-v2' }
  },
  { timestamps: true }
);

// Only one active roadmap per user
roadmapSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Roadmap', roadmapSchema);
