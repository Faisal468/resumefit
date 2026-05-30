export interface WeakBullet {
  original: string;
  suggested: string;
  reason: string;
  accepted: boolean | null;
}

export interface DiffChunk {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

export interface JDAnalysis {
  jobTitle: string;
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  responsibilities: string[];
  educationRequirements: string[];
  experienceYears: string;
}

export interface ATSBreakdown {
  keywordDensity: number;
  skillsMatch: number;
  formatting: number;
  readability: number;
}

export interface AnalysisResult {
  id: string;
  originalPageCount: number;
  atsScore: number;
  atsBreakdown: ATSBreakdown;
  jdMatchScore: number;
  missingKeywords: string[];
  missingSkills: string[];
  presentKeywords: string[];
  jdAnalysis: JDAnalysis;
  weakBullets: WeakBullet[];
  suggestedRewrites: WeakBullet[];
  finalOptimizedResume: string;
  diffViewData: DiffChunk[];
}

export interface ResumeHistoryItem {
  _id: string;
  originalFileName: string;
  atsScore: number;
  jdMatchScore: number;
  jobDescription: string;
  createdAt: string;
}

export type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';

export type TemplateId = 'classic' | 'modern' | 'minimal' | 'executive' | 'compact';

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  font: string;
  accentColor: string;
  previewColors: {
    bg: string;
    header: string;
    accent: string;
  };
}

export interface StructuredPersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface StructuredExperience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface StructuredEducation {
  degree: string;
  school: string;
  location: string;
  graduationYear: string;
  gpa: string;
}

export interface StructuredProject {
  name: string;
  description: string;
  technologies: string[];
  link: string;
}

export interface StructuredResumeData {
  personalInfo: StructuredPersonalInfo;
  summary: string;
  experience: StructuredExperience[];
  education: StructuredEducation[];
  skills: string[];
  projects: StructuredProject[];
  certifications: string[];
}
