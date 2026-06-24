import Groq from 'groq-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Initialize Groq API Client
 */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate AI response using Groq API
 * @param {string} prompt - The prompt to send to AI
 * @param {number} maxTokens - Maximum tokens in response
 * @returns {Promise<string>} - AI generated response
 */
export const generateAIResponse = async (prompt, maxTokens = 2000) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert ATS (Applicant Tracking System) analyzer and career advisor with deep knowledge of resume optimization, skill assessment, and job market trends.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: maxTokens,
      top_p: 1,
      stream: false,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API Error:', error.message);
    throw new Error('Failed to generate AI response');
  }
};

/**
 * Analyze resume with AI
 * @param {string} resumeText - Resume text content
 * @param {string} jobDescription - Job description (optional)
 * @returns {Promise<object>} - Analysis results
 */
export const analyzeResumeWithAI = async (resumeText, jobDescription = '') => {
  const prompt = jobDescription
    ? `Analyze this resume against the job description and provide:
1. ATS Score (0-100)
2. Matched Skills (list)
3. Missing Skills (list)
4. Strengths (3-5 points)
5. Weaknesses (3-5 points)
6. Summary (2-3 sentences)

Resume:
${resumeText}

Job Description:
${jobDescription}

Respond in JSON format with keys: atsScore, matchedSkills, missingSkills, strengths, weaknesses, summary`
    : `Analyze this resume and provide:
1. ATS Score (0-100) based on format, keywords, and content quality
2. Key Skills Found (list)
3. Strengths (3-5 points)
4. Weaknesses (3-5 points)
5. Summary (2-3 sentences)

Resume:
${resumeText}

Respond in JSON format with keys: atsScore, skills, strengths, weaknesses, summary`;

  try {
    const response = await generateAIResponse(prompt, 2500);
    return JSON.parse(response);
  } catch (error) {
    console.error('Resume Analysis Error:', error.message);
    throw error;
  }
};

export default groq;
