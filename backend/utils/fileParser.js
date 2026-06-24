import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';

/**
 * Parse PDF File
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} - Extracted text
 */
export const parsePDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text.trim();
  } catch (error) {
    console.error('PDF Parse Error:', error.message);
    throw new Error('Failed to parse PDF file');
  }
};

/**
 * Parse DOCX File
 * @param {string} filePath - Path to DOCX file
 * @returns {Promise<string>} - Extracted text
 */
export const parseDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value.trim();
  } catch (error) {
    console.error('DOCX Parse Error:', error.message);
    throw new Error('Failed to parse DOCX file');
  }
};

/**
 * Parse Resume File (Auto-detect type)
 * @param {string} filePath - Path to resume file
 * @param {string} fileType - File type (pdf or docx)
 * @returns {Promise<string>} - Extracted text
 */
export const parseResume = async (filePath, fileType) => {
  const type = fileType.toLowerCase();

  if (type === 'pdf') {
    return await parsePDF(filePath);
  } else if (type === 'docx') {
    return await parseDOCX(filePath);
  } else {
    throw new Error('Unsupported file type');
  }
};

/**
 * Extract metadata from resume text
 * @param {string} text - Resume text
 * @returns {object} - Extracted metadata
 */
export const extractMetadata = (text) => {
  const metadata = {
    email: null,
    phone: null,
    linkedin: null,
    github: null,
    website: null,
    location: null,
  };

  // Email regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) metadata.email = emailMatch[0];

  // Phone regex (various formats)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) metadata.phone = phoneMatch[0];

  // LinkedIn regex
  const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i;
  const linkedinMatch = text.match(linkedinRegex);
  if (linkedinMatch) metadata.linkedin = `https://${linkedinMatch[0]}`;

  // GitHub regex
  const githubRegex = /github\.com\/[\w-]+/i;
  const githubMatch = text.match(githubRegex);
  if (githubMatch) metadata.github = `https://${githubMatch[0]}`;

  // Website regex (simple)
  const websiteRegex = /https?:\/\/(www\.)?[\w-]+\.[\w.-]+/gi;
  const websiteMatches = text.match(websiteRegex);
  if (websiteMatches) {
    // Filter out linkedin and github
    const filteredWebsites = websiteMatches.filter(
      (url) => !url.includes('linkedin.com') && !url.includes('github.com')
    );
    if (filteredWebsites.length > 0) metadata.website = filteredWebsites[0];
  }

  return metadata;
};

/**
 * Delete file from filesystem
 * @param {string} filePath - Path to file
 */
export const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('File Delete Error:', error.message);
  }
};

/**
 * Validate resume text
 * @param {string} text - Resume text
 * @returns {boolean}
 */
export const validateResumeText = (text) => {
  if (!text || text.trim().length < 100) {
    throw new Error('Resume text is too short or empty');
  }
  if (text.length > 50000) {
    throw new Error('Resume text is too long');
  }
  return true;
};
