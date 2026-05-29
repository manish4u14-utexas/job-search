# 🚀 AI-Powered Job Search Dashboard

A full-stack job search dashboard that helps you find, analyze, and apply to jobs with AI-powered matching and resume tailoring.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)

## ✨ Features

### 🎯 **Smart Job Matching**
- Real-time job fetching from Indeed and LinkedIn (via JobSpy)
- AI-powered relevance scoring (0-100%)
- Detailed match breakdown (skills, experience, location, title)
- Visa sponsorship detection (critical for international candidates)

### 📝 **Resume Tailoring**
- One-click AI resume customization per job
- Highlights relevant skills and experience
- Preserves original format
- Copy to clipboard functionality

### 📊 **Job Tracking**
- Visual indicators for viewed/applied jobs
- Persistent tracking across sessions
- Statistics dashboard (viewed/applied counts)
- Never apply to the same job twice

### ⚙️ **Multi-LLM Support**
- Groq (free, 100K tokens/day)
- OpenAI (GPT-4)
- Anthropic (Claude)
- Custom providers
- Easy provider switching

### 🎨 **Modern UI**
- Cyberpunk-themed design
- Responsive layout
- Real-time updates
- Toast notifications
- Error handling with helpful messages

## 🛠️ Tech Stack

### **Frontend**
- React 19
- TypeScript
- Vite
- TailwindCSS
- tRPC (type-safe API)
- Wouter (routing)

### **Backend**
- Node.js 20
- Express
- tRPC
- SQLite (via @libsql/client)
- Drizzle ORM

### **Job Scraping**
- Python 3.11
- JobSpy (free, unlimited)

### **AI/LLM**
- OpenAI API
- Groq API
- Anthropic API

## 📋 Prerequisites

- Node.js 20+
- Python 3.11
- pnpm (package manager)
- Groq API key (free at console.groq.com)
- OpenAI API key (optional, backup)

## 🚀 Quick Start

### **1. Clone the Repository**
```bash
git clone https://github.com/YOUR_USERNAME/job-search-dashboard.git
cd job-search-dashboard
```

### **2. Install Dependencies**
```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
pip install jobspy
```

### **3. Configure Environment**
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API keys
GROQ_API_KEY=your_groq_key_here
OPENAI_API_KEY=your_openai_key_here
```

### **4. Initialize Database**
```bash
pnpm run db:push
```

### **5. Start Development Server**
```bash
pnpm run dev
```

Visit `http://localhost:3000`

## 📖 Usage Guide

### **First Time Setup**
1. Go to **Profile** page
2. Upload your resume (PDF, DOCX, or TXT)
3. Review auto-parsed information
4. Add job titles you're looking for
5. Add target locations
6. Save profile

### **Daily Job Search**
1. Select **Indeed** or **LinkedIn** tab
2. Choose time filter (24h, 48h, 72h, 1 week)
3. Choose jobs limit (5, 10, 15, 20, 25, 30)
4. Click **REFRESH**
5. Review jobs with AI match scores
6. For high matches (80%+):
   - Click **ANALYZE MATCH** for details
   - Click **TAILOR RESUME** for customized resume
   - Click **COPY TO CLIPBOARD**
   - Click **APPLY NOW** to open job posting

### **Job Tracking**
- 🟢 **Green border + "✓ APPLIED"** = Already applied
- 🔵 **Cyan border + "👁 VIEWED"** = Already viewed
- ⚪ **No border** = New job

## 🌐 Deployment

### **Deploy to Railway (Recommended)**

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

2. **Deploy on Railway**
- Go to [railway.app](https://railway.app)
- Click "Deploy from GitHub repo"
- Select your repository
- Add environment variables:
  ```
  NODE_ENV=production
  GROQ_API_KEY=your_key
  OPENAI_API_KEY=your_key
  ```

3. **Add Custom Domain (Optional)**
- Railway Dashboard → Settings → Domains
- Add your custom domain
- Configure DNS in your domain provider

**See [DEPLOY_NOW.md](DEPLOY_NOW.md) for detailed instructions.**

## 📚 Documentation

- **[DEPLOY_NOW.md](DEPLOY_NOW.md)** - Quick 5-minute deployment guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Comprehensive deployment options
- **[CUSTOM_DOMAIN_SETUP.md](CUSTOM_DOMAIN_SETUP.md)** - Custom domain configuration
- **[DAILY_WORKFLOW.md](DAILY_WORKFLOW.md)** - Daily usage guide
- **[JOB_TRACKING_FEATURE.md](JOB_TRACKING_FEATURE.md)** - Job tracking documentation
- **[RAILWAY_PRICING_EXPLAINED.md](RAILWAY_PRICING_EXPLAINED.md)** - Pricing details

## 🔑 API Keys

### **Groq (Recommended - Free)**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Create API key
4. 100K tokens/day free tier

### **OpenAI (Backup)**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up
3. Create API key
4. Pay-as-you-go pricing

## 💰 Cost

### **Development (Local)**
- FREE (no hosting costs)

### **Production (Railway)**
- **Hosting:** FREE ($5 credit/month, app uses ~$2/month)
- **Groq API:** FREE (100K tokens/day)
- **OpenAI API:** Pay-as-you-go (optional)
- **Total:** FREE for personal use

## 🎯 Key Features Explained

### **AI Job Matching**
The AI analyzes your complete profile against each job:
- Skills match (technical + soft skills)
- Experience match (years + relevance)
- Location match (remote, hybrid, on-site)
- Title match (job titles you want)
- Visa sponsorship detection

### **Resume Tailoring**
AI customizes your resume for each job:
- Highlights relevant experience
- Emphasizes matching skills
- Preserves original format
- Optimizes for ATS systems

### **Job Tracking**
Never apply twice:
- Tracks viewed jobs
- Tracks applied jobs
- Persists across sessions
- Works across sources (Indeed + LinkedIn)

## 🔧 Configuration

### **LLM Settings**
Configure in Settings page:
- Choose provider (Groq, OpenAI, Anthropic)
- Add API keys
- Test connection
- Switch providers anytime

### **Job Search Filters**
- **Time:** 24h, 48h, 72h, 1 week
- **Limit:** 5, 10, 15, 20, 25, 30 jobs
- **Source:** Indeed, LinkedIn

### **Profile Settings**
- Resume upload
- Skills list
- Job title preferences
- Target locations
- Years of experience

## 🐛 Troubleshooting

### **Rate Limit Errors**
- Wait 30 minutes for Groq to reset
- Switch to OpenAI in Settings
- Reduce jobs limit (try 5 instead of 10)

### **No Jobs Found**
- Check profile has job titles and locations
- Try different time filter (48h or 72h)
- Try different source (Indeed vs LinkedIn)

### **Jobs Not Persisting**
- Check if localStorage is enabled
- Not using incognito mode
- Clear cache and try again

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [JobSpy](https://github.com/Bunsly/JobSpy) - Free job scraping
- [Railway](https://railway.app) - Easy deployment
- [Groq](https://groq.com) - Fast, free LLM API
- [tRPC](https://trpc.io) - Type-safe APIs

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check documentation in `/docs` folder
- Review troubleshooting guides

## 🎉 Features Roadmap

- [ ] Email notifications for new jobs
- [ ] Application tracking dashboard
- [ ] Cover letter generation
- [ ] Interview preparation tips
- [ ] Salary insights
- [ ] Company research integration

---

**Built with ❤️ for job seekers**

**Good luck with your job search! 🚀**
