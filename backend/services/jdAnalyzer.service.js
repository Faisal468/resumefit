const OpenAI = require('openai');
const logger = require('../utils/logger');

// Lazy singleton — instantiated on first call so dotenv is already loaded
let _client;
const getClient = () => {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return _client;
};

const MODEL = () => process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const JD_ANALYSIS_PROMPT = `You are an expert HR analyst and ATS specialist. Analyze the job description below and extract structured information.

Return ONLY valid JSON in this exact format (no extra text, no markdown):
{
  "jobTitle": "string",
  "seniorityLevel": "junior|mid|senior|lead|executive",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "keywords": ["keyword1", "keyword2"],
  "responsibilities": ["responsibility1", "responsibility2"],
  "educationRequirements": ["requirement1"],
  "experienceYears": "string (e.g. '3-5 years')"
}

Rules:
- requiredSkills: hard requirements (must have)
- preferredSkills: nice to have skills
- keywords: ATS-critical terms (technologies, methodologies, certifications)
- Keep all arrays concise (max 15 items each)
- Lowercase all skills and keywords for consistency

Job Description:
`;

/**
 * Analyzes a job description using Groq to extract structured requirements.
 */
const analyzeJD = async (jobDescription) => {
  logger.info(`Analyzing job description via Groq (${MODEL()})...`);

  const response = await getClient().chat.completions.create({
    model: MODEL(),
    messages: [
      {
        role: 'system',
        content: 'You are a precise JSON generator. Return only valid JSON with no markdown fences and no explanation.',
      },
      {
        role: 'user',
        content: JD_ANALYSIS_PROMPT + jobDescription,
      },
    ],
    temperature: 0.1,
    max_tokens: 1024,
  });

  const raw = response.choices[0].message.content;
  const parsed = extractJSON(raw);

  logger.info(`JD analysis complete. Job: "${parsed.jobTitle}", Level: "${parsed.seniorityLevel}"`);
  return parsed;
};

/**
 * Safely extracts JSON from a model response, stripping markdown fences if present.
 */
const extractJSON = (text) => {
  const trimmed = text.trim();

  try { return JSON.parse(trimmed); } catch (_) {}

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return JSON.parse(fenceMatch[1].trim());

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end !== -1) return JSON.parse(trimmed.slice(start, end + 1));

  throw new Error(`Groq returned non-JSON response: ${trimmed.slice(0, 200)}`);
};

module.exports = { analyzeJD };
