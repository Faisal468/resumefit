const OpenAI = require('openai');
const { diffWords } = require('diff');
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

// ─── Prompt Templates ──────────────────────────────────────────────────────────

const WEAK_BULLET_DETECTION_PROMPT = `You are an expert resume coach and ATS specialist. Analyze the resume below and identify weak bullet points.

A bullet point is WEAK if it:
- Uses passive voice ("was responsible for", "helped with")
- Lacks quantifiable metrics or outcomes
- Is vague ("worked on various tasks", "assisted team")
- Starts with weak verbs ("did", "made", "helped")
- Is too short (< 8 words)

Return ONLY valid JSON (no markdown, no explanation):
{
  "weakBullets": [
    {
      "original": "exact original text",
      "reason": "why it is weak",
      "suggested": "stronger rewritten version"
    }
  ]
}

CRITICAL RULES:
- Do NOT fabricate experience, companies, or metrics that aren't implied by context
- Only improve wording and structure
- Add relevant keywords ONLY when naturally fitting
- Keep the same factual content
- Maximum 8 weak bullets to rewrite

Resume:
`;

const RESUME_OPTIMIZER_PROMPT = `You are a senior resume writer and ATS optimization expert. Rewrite the resume to maximize ATS compatibility for the given job description.

STRICT RULES (non-negotiable):
1. Do NOT fabricate any experience, skills, companies, dates, or metrics
2. Only improve wording, structure, and keyword placement
3. Add missing keywords from the JD only where they naturally fit existing content
4. Use strong action verbs (Developed, Led, Architected, Optimized, Delivered)
5. Quantify achievements where context implies numbers (e.g. "multiple clients" → "5+ clients")
6. Maintain ATS-friendly formatting: plain text, no tables, clear section headers
7. Keep all factual content intact

Missing keywords to incorporate naturally: {MISSING_KEYWORDS}
Missing skills to highlight if applicable: {MISSING_SKILLS}

Return the complete optimized resume text. No explanation, no markdown, just the resume.

---
JOB DESCRIPTION:
{JOB_DESCRIPTION}

---
ORIGINAL RESUME:
{RESUME_TEXT}
`;

// ─── Main Service Functions ────────────────────────────────────────────────────

/**
 * Detects weak resume bullets using Groq.
 */
const detectWeakBullets = async (resumeText) => {
  logger.info(`Detecting weak bullets via Groq (${MODEL()})...`);

  const response = await getClient().chat.completions.create({
    model: MODEL(),
    messages: [
      {
        role: 'system',
        content: 'You are a precise JSON generator. Return only valid JSON with no markdown fences and no explanation.',
      },
      {
        role: 'user',
        content: WEAK_BULLET_DETECTION_PROMPT + resumeText,
      },
    ],
    temperature: 0.2,
    max_tokens: 2048,
  });

  const raw = response.choices[0].message.content;
  const parsed = extractJSON(raw);

  logger.info(`Detected ${parsed.weakBullets?.length || 0} weak bullets`);
  return parsed.weakBullets || [];
};

/**
 * Generates a fully optimized resume using Groq.
 */
const rewriteResume = async (resumeText, jobDescription, missingKeywords, missingSkills) => {
  logger.info(`Rewriting resume via Groq (${MODEL()})...`);

  const prompt = RESUME_OPTIMIZER_PROMPT
    .replace('{MISSING_KEYWORDS}', missingKeywords.slice(0, 10).join(', ') || 'none')
    .replace('{MISSING_SKILLS}', missingSkills.slice(0, 10).join(', ') || 'none')
    .replace('{JOB_DESCRIPTION}', jobDescription.slice(0, 3000))
    .replace('{RESUME_TEXT}', resumeText);

  const response = await getClient().chat.completions.create({
    model: MODEL(),
    messages: [
      {
        role: 'system',
        content: 'You are a professional resume writer. Return only the rewritten resume text — no commentary, no markdown, no explanation.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const optimized = response.choices[0].message.content.trim();
  logger.info(`Resume rewritten: ${optimized.length} characters`);
  return optimized;
};

/**
 * Generates a word-level diff between original and optimized resume.
 */
const generateDiff = (original, optimized) => {
  const changes = diffWords(original, optimized);
  return changes.map((part) => ({
    type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
    value: part.value,
  }));
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

module.exports = { detectWeakBullets, rewriteResume, generateDiff };
