import mongoose from 'mongoose';

/**
 * Resume Schema
 * Stores uploaded resume files and parsed content
 */
const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    resumeText: {
      type: String,
      required: [true, 'Resume text is required'],
      maxlength: [50000, 'Resume text is too long'],
    },
    metadata: {
      email: String,
      phone: String,
      linkedin: String,
      github: String,
      website: String,
      location: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for analyses
resumeSchema.virtual('analyses', {
  ref: 'Analysis',
  localField: '_id',
  foreignField: 'resumeId',
});

// Index for efficient queries
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ isDeleted: 1 });

// Pre-find/count middleware to exclude deleted resumes
resumeSchema.pre(/^find|countDocuments/, function (next) {
  if (!this.getQuery().includeDeleted) {
    this.find({ isDeleted: false });
  }
  next();
});

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
