import { generateAIResponse } from '../config/groq.js';
import {
  calculateATSScore,
  extractSkills,
  compareSkills,
  analyzeStrengths,
  analyzeWeaknesses,
} from '../utils/atsScoring.js';

/**
 * Helper to clean and parse JSON from AI response
 * @param {string} text - The response from AI
 * @returns {any} - Parsed JSON object/array
 */
const parseAIJSON = (text) => {
  if (!text) return null;
  
  // Clean markdown code blocks if present
  let cleanText = text.trim();
  if (cleanText.startsWith('```')) {
    const firstLineBreak = cleanText.indexOf('\n');
    if (firstLineBreak !== -1) {
      cleanText = cleanText.substring(firstLineBreak).trim();
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3).trim();
    }
  }

  // Extract from the first '[' or '{' to the last ']' or '}'
  const firstBracket = cleanText.indexOf('[');
  const firstBrace = cleanText.indexOf('{');
  
  let startIdx = -1;
  let endIdx = -1;

  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    startIdx = firstBracket;
    endIdx = cleanText.lastIndexOf(']');
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
    endIdx = cleanText.lastIndexOf('}');
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleanText = cleanText.substring(startIdx, endIdx + 1);
  }

  return JSON.parse(cleanText);
};

/**
 * Analyze resume with comprehensive AI analysis
 * @param {string} resumeText - Resume content
 * @param {string} jobDescription - Optional job description
 * @returns {Promise<object>} - Analysis results
 */
export const analyzeResume = async (resumeText, jobDescription = '') => {
  const startTime = Date.now();

  try {
    // Calculate base ATS score
    let atsScore = calculateATSScore(resumeText);
    let matchedSkills = extractSkills(resumeText);
    let missingSkills = [];

    // If job description provided, compare skills
    if (jobDescription && jobDescription.trim()) {
      const skillComparison = compareSkills(resumeText, jobDescription);
      matchedSkills = skillComparison.matchedSkills;
      missingSkills = skillComparison.missingSkills;
      
      // Adjust ATS score based on job match
      atsScore = Math.round((atsScore * 0.7) + (skillComparison.matchPercentage * 0.3));
    }

    // Get strengths and weaknesses
    const strengths = analyzeStrengths(resumeText);
    const weaknesses = analyzeWeaknesses(resumeText);

    // Try to generate AI summary, fallback to simple summary
    let summary;
    try {
      const summaryPrompt = jobDescription
        ? `Provide a brief 2-3 sentence summary analyzing how well this resume matches the job description:\n\nResume:\n${resumeText.substring(0, 3000)}\n\nJob Description:\n${jobDescription.substring(0, 2000)}`
        : `Provide a brief 2-3 sentence summary of this resume:\n\n${resumeText.substring(0, 3000)}`;

      summary = await generateAIResponse(summaryPrompt, 500);
    } catch (aiError) {
      console.warn('⚠️  AI summary generation failed, using fallback:', aiError.message);
      // Fallback summary
      summary = jobDescription 
        ? `Resume analysis completed with an ATS score of ${atsScore}/100. Found ${matchedSkills.length} matching skills and identified ${missingSkills.length} skills to improve for this role.`
        : `Resume analysis completed with an ATS score of ${atsScore}/100. Identified ${matchedSkills.length} key skills. Consider addressing the areas for improvement to enhance your resume.`;
    }

    const processingTime = Date.now() - startTime;

    return {
      atsScore,
      matchedSkills: matchedSkills.slice(0, 20), // Limit to top 20
      missingSkills: missingSkills.slice(0, 15), // Limit to top 15
      strengths,
      weaknesses,
      summary,
      processingTime,
    };
  } catch (error) {
    console.error('Resume Analysis Error:', error.message);
    throw new Error('Failed to analyze resume');
  }
};

/**
 * Generate improvement suggestions
 * @param {string} resumeText - Resume content
 * @param {Array} weaknesses - Identified weaknesses
 * @returns {Promise<Array>} - Suggestions
 */
export const generateSuggestions = async (resumeText, weaknesses) => {
  try {
    const prompt = `Based on this resume and weaknesses, provide 5-7 specific improvement suggestions. Each suggestion should have a category (formatting, content, keywords, skills, experience, or general), title, description, and priority (low, medium, or high).

Resume excerpt:
${resumeText.substring(0, 2000)}

Weaknesses:
${weaknesses.join('\n')}

Respond in JSON format as an array of objects with keys: category, title, description, priority`;

    const response = await generateAIResponse(prompt, 1500);
    const suggestions = parseAIJSON(response);
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error('Suggestions Generation Error:', error.message);
    // Return default suggestions if AI fails
    return [
      {
        category: 'content',
        title: 'Add Quantifiable Achievements',
        description: 'Include specific metrics and numbers to demonstrate your impact',
        priority: 'high',
      },
      {
        category: 'keywords',
        title: 'Optimize Keywords',
        description: 'Add industry-specific keywords relevant to your target role',
        priority: 'medium',
      },
      {
        category: 'formatting',
        title: 'Improve Structure',
        description: 'Ensure clear section headers and consistent formatting',
        priority: 'medium',
      },
    ];
  }
};

/**
 * Generate interview questions based on resume
 * @param {string} resumeText - Resume content
 * @param {Array} skills - Extracted skills
 * @returns {Promise<Array>} - Interview questions
 */
export const generateInterviewQuestions = async (resumeText, skills) => {
  try {
    const prompt = `Based on this resume and skills, generate 8-10 relevant interview questions. Include a mix of technical, behavioral, and situational questions.

Resume excerpt:
${resumeText.substring(0, 2000)}

Key Skills:
${skills.slice(0, 10).join(', ')}

Respond in JSON format as an array of objects with keys: question, category (technical/behavioral/situational), difficulty (easy/medium/hard)`;

    const response = await generateAIResponse(prompt, 1500);
    const questions = parseAIJSON(response);
    return Array.isArray(questions) ? questions : [];
  } catch (error) {
    console.error('Interview Questions Generation Error:', error.message);
    return [];
  }
};

/**
 * Generate career recommendations
 * @param {string} resumeText - Resume content
 * @param {Array} skills - Extracted skills
 * @returns {Promise<Array>} - Career recommendations
 */
export const generateCareerRecommendations = async (resumeText, skills) => {
  try {
    const prompt = `Based on this resume and skills, suggest 5 potential career paths or job titles that would be a good fit. Include relevance score (0-100) for each.

Resume excerpt:
${resumeText.substring(0, 2000)}

Key Skills:
${skills.slice(0, 15).join(', ')}

Respond in JSON format as an array of objects with keys: title, description, relevanceScore`;

    const response = await generateAIResponse(prompt, 1200);
    const recommendations = parseAIJSON(response);
    return Array.isArray(recommendations) ? recommendations : [];
  } catch (error) {
    console.error('Career Recommendations Error:', error.message);
    return [];
  }
};

/**
 * Perform skill gap analysis
 * @param {Array} matchedSkills - Skills found in resume
 * @param {Array} missingSkills - Skills missing for target role
 * @returns {Promise<object>} - Skill gap analysis
 */
export const performSkillGapAnalysis = async (matchedSkills, missingSkills) => {
  try {
    if (missingSkills.length === 0) {
      return {
        currentLevel: 'Advanced',
        targetLevel: 'Expert',
        missingSkillsCount: 0,
        learningPath: ['Continue building on existing expertise', 'Explore emerging technologies in your field'],
      };
    }

    const prompt = `Provide a skill gap analysis and learning path for someone with these skills who needs to learn these missing skills:

Current Skills: ${matchedSkills.slice(0, 10).join(', ')}
Missing Skills: ${missingSkills.slice(0, 10).join(', ')}

Respond in JSON format with keys: currentLevel (Beginner/Intermediate/Advanced), targetLevel, missingSkillsCount, learningPath (array of 4-5 learning steps)`;

    const response = await generateAIResponse(prompt, 800);
    const analysis = parseAIJSON(response);
    analysis.missingSkillsCount = missingSkills.length;
    return analysis;
  } catch (error) {
    console.error('Skill Gap Analysis Error:', error.message);
    return {
      currentLevel: 'Intermediate',
      targetLevel: 'Advanced',
      missingSkillsCount: missingSkills.length,
      learningPath: missingSkills.slice(0, 5).map(skill => `Learn ${skill}`),
    };
  }
};

/**
 * Rewrite resume section with AI
 * @param {string} sectionText - Section to rewrite
 * @param {string} sectionType - Type of section (summary, experience, etc.)
 * @returns {Promise<string>} - Rewritten section
 */
export const rewriteResumeSection = async (sectionText, sectionType) => {
  try {
    const prompt = `Rewrite this ${sectionType} section of a resume to be more impactful, using strong action verbs and quantifiable achievements where possible. Make it ATS-friendly and professional.

Original:
${sectionText}

Provide only the rewritten text without explanations.`;

    const response = await generateAIResponse(prompt, 1000);
    return response.trim();
  } catch (error) {
    console.error('Resume Rewrite Error:', error.message);
    throw new Error('Failed to rewrite resume section');
  }
};
