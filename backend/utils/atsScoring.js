/**
 * ATS Score Calculation Algorithm
 * Analyzes resume content and calculates ATS compatibility score
 */

/**
 * Calculate base ATS score
 * @param {string} resumeText - Resume text content
 * @returns {number} - Score between 0-100
 */
export const calculateATSScore = (resumeText) => {
  let score = 0;
  const text = resumeText.toLowerCase();

  // 1. Length Check (10 points)
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 1000) {
    score += 10;
  } else if (wordCount >= 200 || wordCount <= 1500) {
    score += 5;
  }

  // 2. Contact Information (10 points)
  const hasEmail = /@[\w.-]+\.\w+/.test(text);
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  if (hasEmail) score += 5;
  if (hasPhone) score += 5;

  // 3. Section Headers (15 points)
  const sections = [
    /experience|work history/i,
    /education|academic/i,
    /skills|competencies/i,
    /summary|objective|profile/i,
  ];
  sections.forEach((regex) => {
    if (regex.test(resumeText)) score += 3.75;
  });

  // 4. Action Verbs (15 points)
  const actionVerbs = [
    'achieved', 'improved', 'managed', 'developed', 'created',
    'implemented', 'designed', 'led', 'increased', 'reduced',
    'launched', 'established', 'optimized', 'analyzed', 'coordinated'
  ];
  let verbCount = 0;
  actionVerbs.forEach((verb) => {
    if (text.includes(verb)) verbCount++;
  });
  score += Math.min((verbCount / actionVerbs.length) * 15, 15);

  // 5. Quantifiable Achievements (15 points)
  const numberPattern = /\d+%|\$\d+|#\d+|\d+\s*(years?|months?)/gi;
  const numbers = resumeText.match(numberPattern) || [];
  score += Math.min(numbers.length * 3, 15);

  // 6. Keywords Density (15 points)
  const commonKeywords = [
    'project', 'team', 'analysis', 'strategy', 'process',
    'client', 'business', 'technical', 'development', 'management'
  ];
  let keywordCount = 0;
  commonKeywords.forEach((keyword) => {
    if (text.includes(keyword)) keywordCount++;
  });
  score += Math.min((keywordCount / commonKeywords.length) * 15, 15);

  // 7. Professional Links (10 points)
  const hasLinkedIn = /linkedin\.com/i.test(text);
  const hasGitHub = /github\.com/i.test(text);
  const hasPortfolio = /portfolio|website/i.test(text);
  if (hasLinkedIn) score += 4;
  if (hasGitHub) score += 3;
  if (hasPortfolio) score += 3;

  // 8. Format Quality (10 points)
  // Check for consistent spacing and structure
  const lines = resumeText.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  const avgLineLength = nonEmptyLines.reduce((sum, line) => sum + line.length, 0) / nonEmptyLines.length;
  if (avgLineLength > 20 && avgLineLength < 100) score += 10;

  return Math.round(Math.min(score, 100));
};

/**
 * Extract skills from resume
 * @param {string} resumeText - Resume text
 * @returns {Array<string>} - List of skills
 */
export const extractSkills = (resumeText) => {
  const text = resumeText.toLowerCase();
  
  const technicalSkills = [
    // Programming Languages
    'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    'typescript', 'go', 'rust', 'scala', 'r', 'matlab', 'perl',
    
    // Web Technologies
    'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django',
    'flask', 'spring boot', 'asp.net', 'laravel', 'rails',
    
    // Databases
    'mongodb', 'mysql', 'postgresql', 'oracle', 'sql server', 'redis',
    'cassandra', 'dynamodb', 'firebase', 'elasticsearch',
    
    // Cloud & DevOps
    'aws', 'azure', 'google cloud', 'docker', 'kubernetes', 'jenkins',
    'terraform', 'ansible', 'ci/cd', 'git', 'github', 'gitlab',
    
    // Data Science & AI
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas',
    'numpy', 'scikit-learn', 'data analysis', 'tableau', 'power bi',
    
    // Mobile
    'android', 'ios', 'react native', 'flutter', 'xamarin',
    
    // Other
    'agile', 'scrum', 'jira', 'api', 'restful', 'graphql', 'microservices',
    'testing', 'jest', 'mocha', 'selenium', 'junit'
  ];

  const foundSkills = [];
  
  technicalSkills.forEach((skill) => {
    if (text.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
};

/**
 * Compare resume skills with job description
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description
 * @returns {object} - Matched and missing skills
 */
export const compareSkills = (resumeText, jobDescription) => {
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobDescription);

  const matchedSkills = resumeSkills.filter(skill => 
    jobSkills.some(jobSkill => jobSkill.toLowerCase() === skill.toLowerCase())
  );

  const missingSkills = jobSkills.filter(skill =>
    !resumeSkills.some(resumeSkill => resumeSkill.toLowerCase() === skill.toLowerCase())
  );

  return {
    matchedSkills,
    missingSkills,
    matchPercentage: jobSkills.length > 0 
      ? Math.round((matchedSkills.length / jobSkills.length) * 100) 
      : 0
  };
};

/**
 * Analyze resume strengths
 * @param {string} resumeText - Resume text
 * @returns {Array<string>} - List of strengths
 */
export const analyzeStrengths = (resumeText) => {
  const strengths = [];
  const text = resumeText.toLowerCase();

  // Check for quantifiable achievements
  const numbers = resumeText.match(/\d+%|\$\d+|#\d+/g) || [];
  if (numbers.length >= 5) {
    strengths.push('Contains quantifiable achievements with metrics and numbers');
  }

  // Check for action verbs
  const actionVerbs = ['achieved', 'improved', 'managed', 'developed', 'led'];
  const verbCount = actionVerbs.filter(verb => text.includes(verb)).length;
  if (verbCount >= 3) {
    strengths.push('Uses strong action verbs to describe accomplishments');
  }

  // Check for technical skills
  const skills = extractSkills(resumeText);
  if (skills.length >= 10) {
    strengths.push(`Demonstrates diverse technical skill set (${skills.length} skills identified)`);
  }

  // Check for professional links
  if (/linkedin\.com/i.test(text) || /github\.com/i.test(text)) {
    strengths.push('Includes professional online presence (LinkedIn/GitHub)');
  }

  // Check for education
  if (/bachelor|master|phd|degree/i.test(text)) {
    strengths.push('Clear educational background provided');
  }

  return strengths.length > 0 ? strengths : ['Resume has basic structure'];
};

/**
 * Analyze resume weaknesses
 * @param {string} resumeText - Resume text
 * @returns {Array<string>} - List of weaknesses
 */
export const analyzeWeaknesses = (resumeText) => {
  const weaknesses = [];
  const text = resumeText.toLowerCase();

  // Check length
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 200) {
    weaknesses.push('Resume is too short - add more detail about your experience');
  } else if (wordCount > 1500) {
    weaknesses.push('Resume is too long - focus on most relevant information');
  }

  // Check for contact info
  if (!/@[\w.-]+\.\w+/.test(text)) {
    weaknesses.push('Missing email address');
  }

  // Check for quantifiable results
  const numbers = resumeText.match(/\d+%|\$\d+/g) || [];
  if (numbers.length < 3) {
    weaknesses.push('Lacks quantifiable achievements - add metrics and numbers');
  }

  // Check for skills section
  const hasSkillsSection = /skills|competencies|technical/i.test(resumeText);
  if (!hasSkillsSection) {
    weaknesses.push('No dedicated skills section found');
  }

  // Check for passive language
  if (/responsible for|duties include/i.test(text)) {
    weaknesses.push('Uses passive language - replace with action verbs');
  }

  return weaknesses.length > 0 ? weaknesses : ['No major weaknesses identified'];
};
