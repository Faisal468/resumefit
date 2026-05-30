const mongoose = require('mongoose');

const weakBulletSchema = new mongoose.Schema(
  {
    original: { type: String, required: true },
    suggested: { type: String, required: true },
    reason: { type: String },
    accepted: { type: Boolean, default: null },
  },
  { _id: false }
);

const diffChunkSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['added', 'removed', 'unchanged'], required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      index: true,
      default: 'anonymous',
    },
    originalFileName: { type: String },
    originalPageCount: { type: Number, default: 1, min: 1 },
    originalResumeText: { type: String, required: true },
    jobDescription: { type: String, required: true },

    // Analysis results
    atsScore: { type: Number, min: 0, max: 100 },
    jdMatchScore: { type: Number, min: 0, max: 100 },

    missingKeywords: [{ type: String }],
    missingSkills: [{ type: String }],
    presentKeywords: [{ type: String }],

    jdAnalysis: {
      requiredSkills: [{ type: String }],
      preferredSkills: [{ type: String }],
      keywords: [{ type: String }],
      seniorityLevel: { type: String },
      jobTitle: { type: String },
    },

    weakBullets: [weakBulletSchema],
    suggestedRewrites: { type: mongoose.Schema.Types.Mixed },

    optimizedResumeText: { type: String },
    structuredData: { type: mongoose.Schema.Types.Mixed },
    diffViewData: [diffChunkSchema],

    // Status tracking
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

resumeSchema.index({ createdAt: -1 });
resumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
