import express from 'express';
import {
  analyzeResumeById,
  getAnalyses,
  getAnalysisById,
  getInterviewQuestions,
  getCareerRecommendations,
  getSkillGapAnalysis,
  rewriteSection,
  deleteAnalysis,
} from '../controllers/analysisController.js';
import { protect } from '../middleware/auth.js';
import {
  analysisValidation,
  analysisIdValidation,
  rewriteSectionValidation,
} from '../validations/resumeValidation.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Analyze resume
router.post(
  '/analyze/:resumeId',
  analysisLimiter,
  analysisValidation,
  analyzeResumeById
);

// Get all analyses
router.get('/', getAnalyses);

// Rewrite section
router.post('/rewrite', analysisLimiter, rewriteSectionValidation, rewriteSection);

// Get single analysis
router.get('/:id', analysisIdValidation, getAnalysisById);

// Generate interview questions
router.post('/:id/interview-questions', analysisIdValidation, getInterviewQuestions);

// Get career recommendations
router.post('/:id/career-recommendations', analysisIdValidation, getCareerRecommendations);

// Get skill gap analysis
router.post('/:id/skill-gap', analysisIdValidation, getSkillGapAnalysis);

// Delete analysis
router.delete('/:id', analysisIdValidation, deleteAnalysis);

export default router;
