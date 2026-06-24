import Analysis from '../models/Analysis.js';
import Resume from '../models/Resume.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  analyzeResume,
  generateSuggestions,
  generateInterviewQuestions,
  generateCareerRecommendations,
  performSkillGapAnalysis,
  rewriteResumeSection,
} from '../services/resumeAnalysis.js';

/**
 * @desc    Analyze resume
 * @route   POST /api/analysis/analyze/:resumeId
 * @access  Private
 */
export const analyzeResumeById = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const { jobDescription = '' } = req.body;

  // Find resume
  const resume = await Resume.findOne({
    _id: resumeId,
    userId: req.user._id,
  });

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: 'Resume not found',
    });
  }

  // Perform analysis
  const analysisResult = await analyzeResume(resume.resumeText, jobDescription);

  // Generate suggestions
  const suggestions = await generateSuggestions(
    resume.resumeText,
    analysisResult.weaknesses
  );

  // Save analysis to database
  const analysis = await Analysis.create({
    userId: req.user._id,
    resumeId: resume._id,
    jobDescription,
    atsScore: analysisResult.atsScore,
    matchedSkills: analysisResult.matchedSkills,
    missingSkills: analysisResult.missingSkills,
    strengths: analysisResult.strengths,
    weaknesses: analysisResult.weaknesses,
    suggestions,
    summary: analysisResult.summary,
    analysisType: jobDescription ? 'job-matched' : 'basic',
    processingTime: analysisResult.processingTime,
  });

  res.status(201).json({
    success: true,
    message: 'Resume analyzed successfully',
    data: analysis,
  });
});

/**
 * @desc    Get all analyses for user
 * @route   GET /api/analysis
 * @access  Private
 */
export const getAnalyses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const analyses = await Analysis.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('resumeId', 'fileName originalName');

  const total = await Analysis.countDocuments({ userId: req.user._id });

  res.json({
    success: true,
    data: {
      analyses,
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
 * @desc    Get single analysis by ID
 * @route   GET /api/analysis/:id
 * @access  Private
 */
export const getAnalysisById = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate('resumeId', 'fileName originalName resumeText');

  if (!analysis) {
    return res.status(404).json({
      success: false,
      message: 'Analysis not found',
    });
  }

  res.json({
    success: true,
    data: analysis,
  });
});

/**
 * @desc    Generate interview questions
 * @route   POST /api/analysis/:id/interview-questions
 * @access  Private
 */
export const getInterviewQuestions = asyncHandler(async (req, res) => {
  console.log(`📋 Generating interview questions for analysis: ${req.params.id}`);
  
  const analysis = await Analysis.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate('resumeId');

  if (!analysis) {
    console.log('❌ Analysis not found');
    return res.status(404).json({
      success: false,
      message: 'Analysis not found',
    });
  }

  console.log(`✅ Analysis found: ${analysis._id}`);
  console.log(`   Resume ID: ${analysis.resumeId._id}`);
  console.log(`   Matched Skills: ${analysis.matchedSkills.length}`);

  // Generate if not already generated
  if (!analysis.interviewQuestions || analysis.interviewQuestions.length === 0) {
    console.log('🔄 Generating new interview questions...');
    
    try {
      const questions = await generateInterviewQuestions(
        analysis.resumeId.resumeText,
        analysis.matchedSkills
      );

      console.log(`✅ Generated ${questions.length} questions`);

      analysis.interviewQuestions = questions;
      await analysis.save();
      
      console.log('💾 Saved interview questions to database');
    } catch (error) {
      console.error('❌ Error generating interview questions:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate interview questions',
        error: error.message,
      });
    }
  } else {
    console.log(`✅ Using cached interview questions (${analysis.interviewQuestions.length})`);
  }

  res.json({
    success: true,
    data: analysis.interviewQuestions,
  });
});

/**
 * @desc    Generate career recommendations
 * @route   POST /api/analysis/:id/career-recommendations
 * @access  Private
 */
export const getCareerRecommendations = asyncHandler(async (req, res) => {
  console.log(`🎯 Generating career recommendations for analysis: ${req.params.id}`);
  
  const analysis = await Analysis.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate('resumeId');

  if (!analysis) {
    console.log('❌ Analysis not found');
    return res.status(404).json({
      success: false,
      message: 'Analysis not found',
    });
  }

  console.log(`✅ Analysis found: ${analysis._id}`);
  console.log(`   Resume ID: ${analysis.resumeId._id}`);
  console.log(`   Matched Skills: ${analysis.matchedSkills.length}`);

  // Generate if not already generated
  if (!analysis.careerRecommendations || analysis.careerRecommendations.length === 0) {
    console.log('🔄 Generating new career recommendations...');
    
    try {
      const recommendations = await generateCareerRecommendations(
        analysis.resumeId.resumeText,
        analysis.matchedSkills
      );

      console.log(`✅ Generated ${recommendations.length} recommendations`);

      analysis.careerRecommendations = recommendations;
      await analysis.save();
      
      console.log('💾 Saved career recommendations to database');
    } catch (error) {
      console.error('❌ Error generating career recommendations:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate career recommendations',
        error: error.message,
      });
    }
  } else {
    console.log(`✅ Using cached career recommendations (${analysis.careerRecommendations.length})`);
  }

  res.json({
    success: true,
    data: analysis.careerRecommendations,
  });
});

/**
 * @desc    Get skill gap analysis
 * @route   POST /api/analysis/:id/skill-gap
 * @access  Private
 */
export const getSkillGapAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!analysis) {
    return res.status(404).json({
      success: false,
      message: 'Analysis not found',
    });
  }

  // Generate if not already generated
  if (!analysis.skillGapAnalysis || !analysis.skillGapAnalysis.currentLevel) {
    const skillGap = await performSkillGapAnalysis(
      analysis.matchedSkills,
      analysis.missingSkills
    );

    analysis.skillGapAnalysis = skillGap;
    await analysis.save();
  }

  res.json({
    success: true,
    data: analysis.skillGapAnalysis,
  });
});

/**
 * @desc    Rewrite resume section
 * @route   POST /api/analysis/rewrite
 * @access  Private
 */
export const rewriteSection = asyncHandler(async (req, res) => {
  const { sectionText, sectionType } = req.body;

  const rewrittenText = await rewriteResumeSection(sectionText, sectionType);

  res.json({
    success: true,
    data: {
      original: sectionText,
      rewritten: rewrittenText,
      sectionType,
    },
  });
});

/**
 * @desc    Delete analysis
 * @route   DELETE /api/analysis/:id
 * @access  Private
 */
export const deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!analysis) {
    return res.status(404).json({
      success: false,
      message: 'Analysis not found',
    });
  }

  res.json({
    success: true,
    message: 'Analysis deleted successfully',
  });
});
