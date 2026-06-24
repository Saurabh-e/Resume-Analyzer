import express from 'express';
import {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
  getResumeStats,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';
import { uploadResume as uploadMiddleware, handleUploadError } from '../middleware/upload.js';
import { resumeIdValidation, uploadResumeValidation } from '../validations/resumeValidation.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Upload resume
router.post(
  '/upload',
  uploadLimiter,
  uploadMiddleware,
  handleUploadError,
  uploadResumeValidation,
  uploadResume
);

// Get all resumes
router.get('/', getResumes);

// Get resume statistics
router.get('/stats', getResumeStats);

// Get single resume
router.get('/:id', resumeIdValidation, getResumeById);

// Delete resume
router.delete('/:id', resumeIdValidation, deleteResume);

export default router;
