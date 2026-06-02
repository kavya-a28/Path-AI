const mongoose = require('mongoose');

// ─── Sub-schemas ────────────────────────────────────────────────────────────

const optionSchema = new mongoose.Schema(
  {
    text:   { type: String, required: true },
    nextId: { type: String, default: null }   // null ⇒ end of branch
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    id:       { type: String, required: true },
    text:     { type: String, required: true },
    field:    { type: String, required: true }, // profile field this question fills
    options:  { type: [optionSchema], required: true }
  },
  { _id: false }
);

// ─── Main Schema ─────────────────────────────────────────────────────────────

const domainQuestionnaireSchema = new mongoose.Schema(
  {
    domainName:      { type: String, required: true, unique: true, trim: true },
    displayName:     { type: String, required: true },
    description:     { type: String, default: '' },
    startingPointId: { type: String, required: true },
    /**
     * questions is stored as a Map so that keys are question IDs (e.g. "web_q1")
     * and values are question objects — matching the spec exactly.
     */
    questions: {
      type: Map,
      of: questionSchema,
      required: true
    }
  },
  { timestamps: true }
);

// unique:true on domainName already creates an index — no extra call needed.

module.exports = mongoose.model('DomainQuestionnaire', domainQuestionnaireSchema);
