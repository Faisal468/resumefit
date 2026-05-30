const logger = require('../utils/logger');

// ATS scoring weights (must sum to 100)
const WEIGHTS = {
  keywordDensity: 40,
  skillsMatch: 30,
  formatting: 15,
  readability: 15,
};

/**
 * Common ATS red-flag patterns (tables, headers/footers, graphics markers).
 */
const BAD_FORMATTING_PATTERNS = [
  /\|.*\|/,            // table pipes
  /_{10,}/,            // long underscores (horizontal rules)
  /\.{10,}/,           // dot leaders
];

/**
 * Sections expected in a well-structured resume.
 */
const EXPECTED_SECTIONS = [
  /experience|work history|employment/i,
  /education|academic/i,
  /skills|technologies|competencies/i,
  /summary|objective|profile/i,
];

/**
 * Calculates an ATS compatibility score (0–100).
 */
const calculateATSScore = (resumeText, jdAnalysis) => {
  const scores = {
    keywordDensity: scoreKeywordDensity(resumeText, jdAnalysis),
    skillsMatch: scoreSkillsMatch(resumeText, jdAnalysis),
    formatting: scoreFormatting(resumeText),
    readability: scoreReadability(resumeText),
  };

  const total = Object.entries(scores).reduce((sum, [key, score]) => {
    return sum + (score * WEIGHTS[key]) / 100;
  }, 0);

  const atsScore = Math.round(Math.min(100, Math.max(0, total)));

  logger.info(`ATS score breakdown: ${JSON.stringify(scores)} → total: ${atsScore}`);

  return { atsScore, breakdown: scores };
};

const scoreKeywordDensity = (text, jdAnalysis) => {
  const lowerText = text.toLowerCase();
  const allKeywords = [...(jdAnalysis.keywords || []), ...(jdAnalysis.requiredSkills || [])];

  if (!allKeywords.length) return 50;

  const found = allKeywords.filter((kw) => lowerText.includes(kw.toLowerCase()));
  return Math.round((found.length / allKeywords.length) * 100);
};

const scoreSkillsMatch = (text, jdAnalysis) => {
  const lowerText = text.toLowerCase();
  const required = jdAnalysis.requiredSkills || [];
  const preferred = jdAnalysis.preferredSkills || [];

  if (!required.length && !preferred.length) return 60;

  const requiredFound = required.filter((s) => lowerText.includes(s.toLowerCase()));
  const preferredFound = preferred.filter((s) => lowerText.includes(s.toLowerCase()));

  const requiredScore = required.length ? (requiredFound.length / required.length) * 70 : 70;
  const preferredScore = preferred.length ? (preferredFound.length / preferred.length) * 30 : 30;

  return Math.round(requiredScore + preferredScore);
};

const scoreFormatting = (text) => {
  let score = 100;

  // Penalize ATS-unfriendly patterns
  BAD_FORMATTING_PATTERNS.forEach((pattern) => {
    if (pattern.test(text)) score -= 15;
  });

  // Reward presence of expected sections
  const sectionCount = EXPECTED_SECTIONS.filter((re) => re.test(text)).length;
  const sectionBonus = (sectionCount / EXPECTED_SECTIONS.length) * 20;

  // Penalize very short or excessively long resumes
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 200) score -= 20;
  if (wordCount > 1200) score -= 10;

  return Math.round(Math.min(100, Math.max(0, score + sectionBonus)));
};

const scoreReadability = (text) => {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  if (!sentences.length) return 50;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgLineLength = lines.reduce((s, l) => s + l.length, 0) / (lines.length || 1);

  let score = 100;

  // Ideal sentence length: 10–20 words
  if (avgWordsPerSentence > 30) score -= 20;
  if (avgWordsPerSentence > 40) score -= 20;

  // Ideal line length: 40–100 chars
  if (avgLineLength > 120) score -= 15;

  return Math.round(Math.min(100, Math.max(0, score)));
};

module.exports = { calculateATSScore };
