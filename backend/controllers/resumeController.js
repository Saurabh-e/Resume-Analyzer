import Resume from '../models/Resume.js';
import Analysis from '../models/Analysis.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { parseResume, extractMetadata, deleteFile, validateResumeText } from '../utils/fileParser.js';
import path from 'path';

/**
 * @desc    Upload and parse resume
 * @route   POST /api/resumes/upload
 * @access  Private
 */
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file',
    });
  }

  const file = req.file;
  const fileType = path.extname(file.originalname).substring(1).toLowerCase();

  try {
    // Parse resume
    const resumeText = await parseResume(file.path, fileType);

    // Validate resume text
    validateResumeText(resumeText);

    // Extract metadata
    const metadata = extractMetadata(resumeText);

    // Save to database
    const resume = await Resume.create({
      userId: req.user._id,
      fileName: file.filename,
      originalName: file.originalname,
      fileType,
      fileSize: file.size,
      filePath: file.path,
      resumeText,
      metadata,
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: resume,
    });
  } catch (error) {
    // Delete file if parsing fails
    await deleteFile(file.path);
    throw error;
  }
});

/**
 * @desc    Get all user resumes
 * @route   GET /api/resumes
 * @access  Private
 */
export const getResumes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const resumes = await Resume.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .select('-resumeText'); // Exclude large text field

  const total = await Resume.countDocuments({ userId: req.user._id });

  res.json({
    success: true,
    data: {
      resumes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * @desc    Get single resume by ID
 * @route   GET /api/resumes/:id
 * @access  Private
 */
export const getResumeById = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'Resume not found',
    });
  }

  res.json({
    success: true,
    data: resume,
  });
});

/**
 * @desc    Delete resume
 * @route   DELETE /api/resumes/:id
 * @access  Private
 */
export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'Resume not found',
    });
  }

  // Soft delete
  resume.isDeleted = true;
  await resume.save();

  // Delete physical file
  await deleteFile(resume.filePath);

  // Delete associated analyses
  await Analysis.deleteMany({ resumeId: resume._id });

  res.json({
    success: true,
    message: 'Resume deleted successfully',
  });
});

/**
 * @desc    Get resume statistics
 * @route   GET /api/resumes/stats
 * @access  Private
 */
export const getResumeStats = asyncHandler(async (req, res) => {
  const totalResumes = await Resume.countDocuments({ userId: req.user._id });
  
  const recentResumes = await Resume.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('fileName originalName createdAt');

  res.json({
    success: true,
    data: {
      totalResumes,
      recentResumes,
    },
  });
});
