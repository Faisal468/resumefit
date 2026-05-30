const logger = require('../utils/logger');

/**
 * Compares resume text against JD analysis to find gaps.
 * Uses token-level matching with synonym awareness.
 */
const analyzeGap = (resumeText, jdAnalysis) => {
  const lowerResume = resumeText.toLowerCase();

  const requiredSkills = jdAnalysis.requiredSkills || [];
  const preferredSkills = jdAnalysis.preferredSkills || [];
  const keywords = jdAnalysis.keywords || [];

  const missingSkills = requiredSkills.filter((skill) => !isPresent(lowerResume, skill));
  const missingKeywords = keywords.filter((kw) => !isPresent(lowerResume, kw));
  const presentKeywords = keywords.filter((kw) => isPresent(lowerResume, kw));
  const presentSkills = requiredSkills.filter((skill) => isPresent(lowerResume, skill));

  // JD match score: weighted blend of required skills + keywords
  const totalRequired = requiredSkills.length + keywords.length;
  const totalFound = presentSkills.length + presentKeywords.length;
  const jdMatchScore =
    totalRequired > 0 ? Math.round((totalFound / totalRequired) * 100) : 50;

  logger.info(
    `Gap analysis: match=${jdMatchScore}%, missing skills=${missingSkills.length}, missing keywords=${missingKeywords.length}`
  );

  return {
    jdMatchScore,
    missingSkills,
    missingKeywords,
    presentKeywords,
    presentSkills,
  };
};

/**
 * Checks if a skill/keyword is present in the resume using flexible matching.
 */
const isPresent = (text, term) => {
  const normalized = term.toLowerCase().trim();

  // Direct inclusion
  if (text.includes(normalized)) return true;

  // Handle acronyms (e.g. "ml" vs "machine learning")
  const SYNONYM_MAP = {
    'machine learning': ['ml'],
    'artificial intelligence': ['ai'],
    'javascript': ['js'],
    'typescript': ['ts'],
    'node.js': ['nodejs', 'node js'],
    'react.js': ['reactjs', 'react js', 'react'],
    'next.js': ['nextjs', 'next js'],
    'postgresql': ['postgres'],
    'mongodb': ['mongo'],
    'kubernetes': ['k8s'],
    'continuous integration': ['ci', 'ci/cd'],
    'continuous deployment': ['cd', 'ci/cd'],
    'application programming interface': ['api'],
    'representational state transfer': ['rest', 'rest api'],
    'user interface': ['ui'],
    'user experience': ['ux'],
  };

  const synonyms = SYNONYM_MAP[normalized] || [];
  return synonyms.some((s) => text.includes(s));
};

module.exports = { analyzeGap };
