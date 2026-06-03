# AI-Powered Job Search Dashboard

An intelligent job search platform that helps you find, track, and apply to jobs with AI-powered resume tailoring and job matching.

## Features

- 🔍 **Real-time Job Search** - Fetch jobs from Indeed (USA, India, UK, Canada) and ZipRecruiter using JobSpy
- 🌍 **Regional Job Tabs** - Separate tabs for USA, India, and Middle East jobs with automatic profile matching
- 🤖 **AI Resume Parsing** - Automatically extract skills and experience from your resume
- 📝 **Smart Job Matching** - AI analyzes job descriptions and matches them to your profile (40%+ match threshold)
- ✍️ **Resume Tailoring** - Generate customized resumes for each job application
- 💌 **Cover Letter Generation** - AI-powered cover letters tailored to each position
- 📊 **Application Tracking** - Track your applications and follow-ups
- 🎯 **Recruiter Management** - Save and manage recruiter contacts

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, tRPC
- **Database**: SQLite with Drizzle ORM
- **AI**: OpenAI GPT-4o / Groq Llama
- **Job Scraping**: Python JobSpy

## Prerequisites

- Node.js 18+ and pnpm
- Python 3.11+ (for JobSpy)
- OpenAI or Groq API key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/manish4u14-utexas/job-search.git
cd job-search-dashboard
```

### 2. Install Node.js dependencies

```bash
pnpm install
```

### 3. Install Python JobSpy

```bash
python3.11 -m pip install python-jobspy
```

### 4. Set up environment variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required: At least one LLM provider
OPENAI_API_KEY=your_openai_key_here
# OR
GROQ_API_KEY=your_groq_key_here

# Database (auto-created)
DATABASE_URL=file:./dev.db

NODE_ENV=development
```

### 5. Initialize the database

```bash
pnpm run db:push
```

### 6. Start the development server

```bash
pnpm run dev
```

The app will be available at `http://localhost:3000`

## Usage

### 1. Set up your profile

1. Go to **Profile** page
2. Upload your resume (PDF or DOCX)
3. Click **"AUTO-FILL FROM RESUME"** to extract your information
4. Review and edit the extracted data
5. Click **"SAVE PROFILE"**

### 2. Configure LLM Settings

1. Go to **Settings** page
2. Choose your LLM provider (OpenAI recommended for best results)
3. Enter your API key
4. Select the model (gpt-4o recommended)
5. Click **"SAVE SETTINGS"**

### 3. Search for jobs

1. Go to **Dashboard**
2. Choose your region tab:
   - **USA** - Jobs from Indeed + ZipRecruiter (Remote, New York, SF, Austin, etc.)
   - **INDIA** - Jobs from Indeed India (Bangalore, Mumbai, Delhi, Hyderabad, Pune, Chennai)
   - **MIDDLE EAST** - Jobs from Bayt (Dubai, Abu Dhabi, Riyadh, Doha, Kuwait City)
3. Jobs are automatically filtered to match your profile (40%+ match score)
4. Click **REFRESH JOBS** to fetch the latest opportunities
5. Each tab shows only jobs matching your profile skills and preferences

### 4. Apply to jobs

1. Click on a job card to see details
2. Review the AI match score and analysis
3. Click **"TAILOR RESUME"** to generate a customized resume
4. Click **"GENERATE COVER LETTER"** for a personalized cover letter
5. Track your application status

## Project Structure

```
job-search-dashboard/
├── client/              # React frontend
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page components
│       └── lib/         # Utilities and helpers
├── server/              # Express backend
│   ├── _core/          # Core server setup
│   ├── routers.ts      # tRPC API routes
│   ├── db.ts           # Database queries
│   └── llm-services.ts # AI/LLM integrations
├── scripts/            # Python scripts
│   └── fetch-jobs.py   # JobSpy integration
├── drizzle/            # Database schema and migrations
└── shared/             # Shared types and utilities
```

## Configuration

### LLM Providers

The app supports multiple LLM providers:

- **OpenAI** (Recommended): Best for structured output and resume parsing
  - Model: `gpt-4o` or `gpt-4o-mini`
  - Get API key: https://platform.openai.com

- **Groq**: Faster and free tier available
  - Model: `llama-3.3-70b-versatile`
  - Get API key: https://console.groq.com
  - Note: Use OpenAI for resume parsing (Groq has issues with structured JSON)

### Job Search

JobSpy fetches real jobs from:
- **Indeed** - Supports multiple countries (USA, India, UK, Canada, etc.)
- **ZipRecruiter** - US jobs
- **Bayt** - Middle East jobs (UAE, Saudi Arabia, Qatar, Kuwait)

**Regional Tabs:**
- **USA Tab**: Searches Indeed (USA) + ZipRecruiter for locations like Remote, New York, San Francisco, Austin
- **India Tab**: Searches Indeed India for locations like Bangalore, Mumbai, Delhi, Hyderabad, Pune, Chennai
- **Middle East Tab**: Searches Bayt for locations like Dubai, Abu Dhabi, Riyadh, Doha, Kuwait City

The app automatically:
1. Fetches jobs from the selected region
2. Analyzes each job against your profile using AI
3. Shows only jobs with 40%+ match score
4. Displays match reasoning for each job

Configure search parameters in your profile:
- Job titles you're interested in
- Target locations
- Years of experience

## Development

### Build for production

```bash
pnpm run build
```

### Run production build

```bash
pnpm start
```

### Database migrations

```bash
pnpm run db:push
```

## Troubleshooting

### Resume parsing returns empty fields

- Make sure you're using **OpenAI** as the LLM provider
- Groq has issues with structured JSON output
- Check that your API key is valid

### No jobs found

- Verify Python 3.11+ is installed: `python3.11 --version`
- Check JobSpy is installed: `python3.11 -m pip list | grep jobspy`
- Try broader search terms in your profile

### Database errors

- Delete `dev.db` and run `pnpm run db:push` to recreate
- Check file permissions on the database file

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For issues or questions, please open an issue on GitHub.
