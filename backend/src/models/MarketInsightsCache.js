/**
 * MarketInsightsCache.js
 * Stores AI-generated market skill data per user + career path.
 * Used to avoid repeated Tavily / Groq calls within a 24-hour window.
 */

const mongoose = require('mongoose');

const cachedSkillSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  demand:   { type: Number, required: true },
  jobs:     { type: Number, required: true },
  keywords: [String],
  color:    { type: String, default: 'from-blue-500 to-cyan-500' },
}, { _id: false });

const marketInsightsCacheSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  careerPath: {
    type: String,
    required: true,
  },
  skills: [cachedSkillSchema],
  marketData: {
    activeJobs:    { type: Number, default: 0 },
    avgSalary:     { type: String, default: '—' },
    growthRate:    { type: Number, default: 0 },
    totalPostings: { type: Number, default: 0 },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index: one cache entry per user + career path
marketInsightsCacheSchema.index({ userId: 1, careerPath: 1 }, { unique: true });

module.exports = mongoose.model('MarketInsightsCache', marketInsightsCacheSchema);
