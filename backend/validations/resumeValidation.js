import { body, param, validationResult } from 'express-validator';

/**
 * Validation middleware wrapper
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Resume upload validation
 */
export const uploadResumeValidation = [
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file',
      });
    }
    next();
  },
];

/**
 * Analysis request validation
 */
export const analysisValidation = [
  body('jobDescription')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Job description is too long (max 10000 characters)'),
  
  validate,
];

/**
 * Resume ID parameter validation
 */
export const resumeIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Resume ID is required')
    .isMongoId()
    .withMessage('Invalid resume ID format'),
  
  validate,
];

/**
 * Analysis ID parameter validation
 */
export const analysisIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Analysis ID is required')
    .isMongoId()
    .withMessage('Invalid analysis ID format'),
  
  validate,
];

/**
 * Rewrite section validation
 */
export const rewriteSectionValidation = [
  body('sectionText')
    .notEmpty()
    .withMessage('Section text is required')
    .isLength({ min: 50, max: 5000 })
    .withMessage('Section text must be between 50 and 5000 characters'),
  
  body('sectionType')
    .notEmpty()
    .withMessage('Section type is required')
    .isIn(['summary', 'experience', 'education', 'skills', 'projects'])
    .withMessage('Invalid section type'),
  
  validate,
];
