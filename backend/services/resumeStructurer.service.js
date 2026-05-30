const OpenAI = require('openai');

let _client;
const getClient = () => {
  if (!_client) _client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
  return _client;
};
const MODEL = () => process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are a resume parser. Extract structured data from the given resume text and return ONLY valid JSON matching this schema exactly:

{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "website": "string"
  },
  "summary": "string",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "location": "string",
      "graduationYear": "string",
      "gpa": "string"
    }
  ],
  "skills": ["string"],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string"
    }
  ],
  "certifications": ["string"]
}

Rules:
- Return ONLY the JSON object, no markdown fences, no explanation
- Use empty string "" for missing fields, empty array [] for missing arrays
- skills must be a flat array of individual skill strings
- Split multi-sentence experience descriptions into separate bullet strings
- If no section exists, use an empty array`;

function extractJSON(raw) {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) raw = fenceMatch[1];
  const braceStart = raw.indexOf('{');
  const braceEnd = raw.lastIndexOf('}');
  if (braceStart !== -1 && braceEnd !== -1) {
    raw = raw.slice(braceStart, braceEnd + 1);
  }
  return JSON.parse(raw);
}

const structureResume = async (resumeText) => {
  const response = await getClient().chat.completions.create({
    model: MODEL(),
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Resume text:\n\n${resumeText}` },
    ],
    temperature: 0.1,
    max_tokens: 2048,
  });

  const raw = response.choices[0]?.message?.content || '{}';
  try {
    return extractJSON(raw);
  } catch {
    return {
      personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
      summary: resumeText.slice(0, 200),
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
    };
  }
};

module.exports = { structureResume };
