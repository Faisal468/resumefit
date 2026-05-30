# ResumeFit — AI Resume Optimizer & ATS Checker

A production-ready AI SaaS application that analyzes resumes against job descriptions using GPT-4o.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, ShadCN UI |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| AI | OpenAI GPT-4o |
| File Parsing | pdf-parse, mammoth |
| Export | Puppeteer-core (PDF), docx (DOCX) |

## Project Structure

```
ResumeFit/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # resume.controller.js
│   ├── middleware/      # upload.js, errorHandler.js
│   ├── models/          # Resume.model.js
│   ├── routes/          # resume.routes.js
│   ├── services/
│   │   ├── parser.service.js       # PDF/DOCX text extraction
│   │   ├── jdAnalyzer.service.js   # GPT JD analysis
│   │   ├── ats.service.js          # ATS scoring algorithm
│   │   ├── gap.service.js          # Resume vs JD gap analysis
│   │   ├── rewrite.service.js      # GPT bullet rewriting + diff
│   │   └── export.service.js       # PDF/DOCX export
│   ├── utils/           # logger.js
│   └── server.js
└── frontend/
    ├── app/
    │   ├── page.tsx                 # Upload page (home)
    │   ├── dashboard/[id]/page.tsx  # Results dashboard
    │   ├── diff/[id]/page.tsx       # Before/after diff view
    │   └── export/[id]/page.tsx     # Export PDF/DOCX
    ├── components/
    │   ├── FileUploader.tsx
    │   ├── ScoreRing.tsx
    │   ├── KeywordBadges.tsx
    │   ├── WeakBulletsPanel.tsx
    │   ├── DiffViewer.tsx
    │   └── Navbar.tsx
    ├── lib/
    │   ├── api.ts                   # Axios API client
    │   └── utils.ts
    └── types/index.ts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/analyze` | Main pipeline: parse → analyze → score → rewrite |
| GET | `/api/resume/:id` | Fetch single analysis result |
| GET | `/api/resume/history` | Paginated analysis history |
| PATCH | `/api/resume/:id/accept-change` | Accept/reject a bullet rewrite |
| POST | `/api/resume/:id/export/pdf` | Download optimized PDF |
| POST | `/api/resume/:id/export/docx` | Download optimized DOCX |
| DELETE | `/api/resume/:id` | Delete an analysis |

## Setup

### Backend

```bash
cd backend
cp .env.example .env
# Fill in MONGODB_URI and OPENAI_API_KEY
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

**Backend `.env`:**
```
PORT=5000
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
MAX_FILE_SIZE_MB=10
CORS_ORIGIN=http://localhost:3000
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## AI Pipeline

```
Upload Resume (PDF/DOCX)
        │
        ▼
[1] Parser Service      — Extract & clean text
        │
        ▼
[2] JD Analyzer         — GPT extracts skills, keywords, seniority
        │
        ▼
[3] ATS Checker         — Keyword density + formatting score (0-100)
        │
        ▼
[4] Gap Matcher         — Missing skills + JD match % 
        │
        ▼
[5] Rewrite Agent       — GPT rewrites weak bullets + full resume
        │
        ▼
[6] Diff Generator      — Word-level before/after comparison
        │
        ▼
    Dashboard + Export
```
