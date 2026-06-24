import mongoose from 'mongoose';

/**
 * Analysis Schema
 * Stores ATS analysis results and AI-generated insights
 */
const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    jobDescription: {
      type: String,
      default: '',
      maxlength: [10000, 'Job description is too long'],
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchedSkills: [{
      type: String,
      trim: true,
    }],
    missingSkills: [{
      type: String,
      trim: true,
    }],
    strengths: [{
      type: String,
      trim: true,
    }],
    weaknesses: [{
      type: String,
      trim: true,
    }],
    suggestions: [{
      category: {
        type: String,
        enum: ['formatting', 'content', 'keywords', 'skills', 'experience', 'general'],
      },
      title: String,
      description: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
    }],
    summary: {
      type: String,
      required: true,
      maxlength: [2000, 'Summary is too long'],
    },
    interviewQuestions: [{
      question: String,
      category: String,
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
      },
    }],
    careerRecommendations: [{
      title: String,
      description: String,
      relevanceScore: {
        type: Number,
        min: 0,
        max: 100,
      },
    }],
    skillGapAnalysis: {
      currentLevel: String,
      targetLevel: String,
      missingSkillsCount: Number,
      learningPath: [String],
    },
    analysisType: {
      type: String,
      enum: ['basic', 'job-matched', 'comprehensive'],
      default: 'basic',
    },
    processingTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ resumeId: 1 });
analysisSchema.index({ atsScore: -1 });

// Static method to get average ATS score for a user
analysisSchema.statics.getAverageScore = async function (userId) {
  const result = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, avgScore: { $avg: '$atsScore' } } },
  ]);
  return result[0]?.avgScore || 0;
};

// Static method to get score trends
analysisSchema.statics.getScoreTrends = async function (userId, days = 30) {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: dateFrom },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        avgScore: { $avg: '$atsScore' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
