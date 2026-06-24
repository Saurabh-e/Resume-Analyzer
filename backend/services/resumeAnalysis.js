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
    console.log('🎯 Generating interview questions...');
    console.log(`   Resume length: ${resumeText.length} chars`);
    console.log(`   Skills count: ${skills.length}`);
    
    const prompt = `Based on this resume and skills, generate 8-10 relevant interview questions. Include a mix of technical, behavioral, and situational questions.

Resume excerpt:
${resumeText.substring(0, 2000)}

Key Skills:
${skills.slice(0, 10).join(', ')}

Respond ONLY with a valid JSON array. Each question must have: question, category (technical/behavioral/situational), difficulty (easy/medium/hard).

Example format:
[
  {
    "question": "Can you describe a challenging project you worked on?",
    "category": "behavioral",
    "difficulty": "medium"
  }
]`;

    const response = await generateAIResponse(prompt, 1500);
    console.log('📝 AI Response received:', response.substring(0, 200));
    
    const questions = parseAIJSON(response);
    console.log(`✅ Parsed ${questions.length} questions`);
    
    // Validate questions
    const validQuestions = Array.isArray(questions) 
      ? questions.filter(q => q.question && q.category && q.difficulty)
      : [];
    
    if (validQuestions.length === 0) {
      console.warn('⚠️  No valid questions generated, using fallback');
      return generateFallbackInterviewQuestions(skills);
    }
    
    return validQuestions;
  } catch (error) {
    console.error('❌ Interview Questions Generation Error:', error.message);
    console.error('   Stack:', error.stack);
    return generateFallbackInterviewQuestions(skills);
  }
};

/**
 * Generate fallback interview questions when AI fails
 * @param {Array} skills - Skills array
 * @returns {Array} - Fallback questions
 */
const generateFallbackInterviewQuestions = (skills) => {
  const topSkills = skills.slice(0, 5);
  const questions = [
    {
      question: "Can you walk me through your resume and highlight your key accomplishments?",
      category: "behavioral",
      difficulty: "easy"
    },
    {
      question: "Tell me about a challenging project you worked on and how you overcame obstacles.",
      category: "behavioral",
      difficulty: "medium"
    },
    {
      question: "How do you stay updated with the latest trends and technologies in your field?",
      category: "behavioral",
      difficulty: "easy"
    },
    {
      question: "Describe a time when you had to work under pressure to meet a deadline.",
      category: "situational",
      difficulty: "medium"
    },
    {
      question: "How do you prioritize tasks when working on multiple projects simultaneously?",
      category: "situational",
      difficulty: "medium"
    },
  ];
  
  // Add skill-specific questions
  topSkills.forEach(skill => {
    questions.push({
      question: `Can you describe your experience with ${skill} and provide a specific example?`,
      category: "technical",
      difficulty: "medium"
    });
  });
  
  return questions.slice(0, 10);
};

/**
 * Generate career recommendations
 * @param {string} resumeText - Resume content
 * @param {Array} skills - Extracted skills
 * @returns {Promise<Array>} - Career recommendations
 */
export const generateCareerRecommendations = async (resumeText, skills) => {
  try {
    console.log('🚀 Generating career recommendations...');
    console.log(`   Resume length: ${resumeText.length} chars`);
    console.log(`   Skills count: ${skills.length}`);
    
    const prompt = `Based on this resume and skills, suggest 5 potential career paths or job titles that would be a good fit. Include relevance score (0-100) for each.

Resume excerpt:
${resumeText.substring(0, 2000)}

Key Skills:
${skills.slice(0, 15).join(', ')}

Respond ONLY with a valid JSON array. Each recommendation must have: title, description, relevanceScore (number 0-100).

Example format:
[
  {
    "title": "Senior Software Engineer",
    "description": "Lead development projects and mentor junior developers",
    "relevanceScore": 85
  }
]`;

    const response = await generateAIResponse(prompt, 1200);
    console.log('📝 AI Response received:', response.substring(0, 200));
    
    const recommendations = parseAIJSON(response);
    console.log(`✅ Parsed ${recommendations.length} recommendations`);
    
    // Validate recommendations
    const validRecommendations = Array.isArray(recommendations)
      ? recommendations.filter(r => r.title && r.description && typeof r.relevanceScore === 'number')
      : [];
    
    if (validRecommendations.length === 0) {
      console.warn('⚠️  No valid recommendations generated, using fallback');
      return generateFallbackCareerRecommendations(skills);
    }
    
    return validRecommendations;
  } catch (error) {
    console.error('❌ Career Recommendations Error:', error.message);
    console.error('   Stack:', error.stack);
    return generateFallbackCareerRecommendations(skills);
  }
};

/**
 * Generate fallback career recommendations when AI fails
 * @param {Array} skills - Skills array
 * @returns {Array} - Fallback recommendations
 */
const generateFallbackCareerRecommendations = (skills) => {
  // Analyze skills to suggest relevant careers
  const hasWebDev = skills.some(s => 
    ['javascript', 'react', 'angular', 'vue', 'html', 'css', 'frontend', 'web'].some(tech => 
      s.toLowerCase().includes(tech)
    )
  );
  
  const hasBackend = skills.some(s => 
    ['python', 'java', 'node', 'spring', 'django', 'backend', 'api', 'database'].some(tech => 
      s.toLowerCase().includes(tech)
    )
  );
  
  const hasDataScience = skills.some(s => 
    ['python', 'machine learning', 'data', 'analytics', 'ml', 'ai', 'tensorflow', 'pandas'].some(tech => 
      s.toLowerCase().includes(tech)
    )
  );
  
  const hasDevOps = skills.some(s => 
    ['docker', 'kubernetes', 'aws', 'azure', 'ci/cd', 'jenkins', 'devops', 'cloud'].some(tech => 
      s.toLowerCase().includes(tech)
    )
  );
  
  const hasManagement = skills.some(s => 
    ['leadership', 'management', 'team', 'project', 'agile', 'scrum'].some(tech => 
      s.toLowerCase().includes(tech)
    )
  );

  const recommendations = [];

  if (hasWebDev && hasBackend) {
    recommendations.push({
      title: "Full Stack Developer",
      description: "Build complete web applications from frontend to backend, working with modern frameworks and databases.",
      relevanceScore: 90
    });
  }

  if (hasWebDev) {
    recommendations.push({
      title: "Frontend Developer",
      description: "Create engaging user interfaces and experiences using modern web technologies and frameworks.",
      relevanceScore: 85
    });
  }

  if (hasBackend) {
    recommendations.push({
      title: "Backend Engineer",
      description: "Design and implement server-side logic, APIs, and database architectures for scalable applications.",
      relevanceScore: 85
    });
  }

  if (hasDataScience) {
    recommendations.push({
      title: "Data Scientist",
      description: "Analyze complex data sets and build machine learning models to drive business insights and decisions.",
      relevanceScore: 82
    });
  }

  if (hasDevOps) {
    recommendations.push({
      title: "DevOps Engineer",
      description: "Automate deployment pipelines, manage cloud infrastructure, and ensure reliable system operations.",
      relevanceScore: 80
    });
  }

  if (hasManagement) {
    recommendations.push({
      title: "Technical Lead",
      description: "Lead engineering teams, make architectural decisions, and guide technical strategy.",
      relevanceScore: 78
    });
  }

  // Add generic recommendations if not enough specific ones
  if (recommendations.length < 3) {
    recommendations.push(
      {
        title: "Software Engineer",
        description: "Develop software solutions across various domains using your technical skills and experience.",
        relevanceScore: 75
      },
      {
        title: "Solutions Architect",
        description: "Design comprehensive technical solutions and system architectures for complex business needs.",
        relevanceScore: 72
      },
      {
        title: "Technical Consultant",
        description: "Provide expert technical guidance and solutions to clients across different industries.",
        relevanceScore: 70
      }
    );
  }

  return recommendations.slice(0, 5);
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
