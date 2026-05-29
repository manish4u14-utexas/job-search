# 🚀 Push to GitHub - Complete Guide

## Step 1: Clean Up Project (2 minutes)

Run the cleanup script to remove unnecessary files:

```bash
# Navigate to project directory
cd /Users/manishkumar/Library/CloudStorage/OneDrive-AlignTechnology,Inc/Desktop/job-search-dashboard

# Make cleanup script executable
chmod +x cleanup.sh

# Run cleanup
./cleanup.sh
```

This will remove:
- ✅ Old development notes
- ✅ Temporary files
- ✅ Build artifacts
- ✅ Development database
- ✅ Logs

## Step 2: Create .env.example (1 minute)

Create an example environment file (without real keys):

```bash
cat > .env.example << 'EOF'
# LLM API Keys
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database (auto-created)
DATABASE_URL=file:./dev.db

# Node Environment
NODE_ENV=development
EOF
```

## Step 3: Initialize Git (1 minute)

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: AI-powered job search dashboard

Features:
- Real-time job fetching (Indeed + LinkedIn)
- AI-powered job matching
- Resume tailoring
- Job tracking
- Multi-LLM support (Groq, OpenAI, Anthropic)
- Visa sponsorship detection
- Custom domain support
"
```

## Step 4: Create GitHub Repository (2 minutes)

### **Option A: Using GitHub Website**

1. Go to [github.com](https://github.com)
2. Click **"+"** → **"New repository"**
3. Fill in:
   ```
   Repository name: job-search-dashboard
   Description: AI-powered job search dashboard with smart matching and resume tailoring
   Visibility: Private (recommended) or Public
   ```
4. **DO NOT** initialize with README, .gitignore, or license
5. Click **"Create repository"**

### **Option B: Using GitHub CLI**

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Login to GitHub
gh auth login

# Create repository
gh repo create job-search-dashboard --private --source=. --remote=origin --push
```

## Step 5: Push to GitHub (1 minute)

### **If you created repo on website:**

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/job-search-dashboard.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

### **If you used GitHub CLI:**

Already pushed! Skip to Step 6.

## Step 6: Verify Upload (1 minute)

Visit your repository:
```
https://github.com/YOUR_USERNAME/job-search-dashboard
```

Check that you see:
- ✅ README.md displayed
- ✅ Source code (client/, server/, scripts/)
- ✅ Configuration files
- ✅ Documentation files
- ❌ No .env file (should be ignored)
- ❌ No node_modules (should be ignored)
- ❌ No dev.db (should be ignored)

## Step 7: Add Repository Description (Optional)

On GitHub repository page:
1. Click **"⚙️ Settings"**
2. Add description:
   ```
   AI-powered job search dashboard with smart matching, resume tailoring, and job tracking. Built with React, Node.js, Python, and multiple LLM providers.
   ```
3. Add topics:
   ```
   job-search, ai, llm, react, nodejs, python, typescript, groq, openai
   ```
4. Save changes

## 🎉 Done! Your Project is on GitHub!

### **Next Steps:**

1. **Deploy to Railway:**
   - Follow [DEPLOY_NOW.md](DEPLOY_NOW.md)
   - Connect GitHub repo
   - Auto-deploy on push

2. **Set Up Custom Domain:**
   - Follow [CUSTOM_DOMAIN_SETUP.md](CUSTOM_DOMAIN_SETUP.md)
   - Use job-search.sprintpulse.ai

3. **Start Job Searching:**
   - Access your deployed app
   - Complete profile
   - Search for jobs!

---

## 📋 Quick Reference

### **Repository Structure:**
```
job-search-dashboard/
├── client/              # React frontend
├── server/              # Express backend
├── scripts/             # Python job scraping
├── shared/              # Shared types
├── drizzle/             # Database schema
├── .env.example         # Environment template
├── package.json         # Dependencies
├── README.md            # Main documentation
├── DEPLOY_NOW.md        # Deployment guide
└── [other docs]         # Additional guides
```

### **Important Files:**
- ✅ `.gitignore` - Excludes sensitive files
- ✅ `.env.example` - Environment template
- ✅ `README.md` - Main documentation
- ✅ `nixpacks.toml` - Railway configuration
- ✅ `.railwayignore` - Railway exclusions

### **Excluded from Git:**
- ❌ `.env` - Your API keys (NEVER commit!)
- ❌ `node_modules/` - Dependencies
- ❌ `dist/` - Build output
- ❌ `dev.db` - Local database
- ❌ `.manus-logs/` - Logs

---

## 🔒 Security Checklist

Before pushing, verify:

- [ ] `.env` is in `.gitignore`
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] `.env.example` has placeholder values only
- [ ] `dev.db` is excluded
- [ ] No sensitive data in commits

---

## 🔄 Future Updates

After initial push, to update:

```bash
# Make changes to code
# ...

# Stage changes
git add .

# Commit with message
git commit -m "Add new feature: XYZ"

# Push to GitHub
git push

# Railway auto-deploys! 🎉
```

---

## 🐛 Troubleshooting

### **"fatal: remote origin already exists"**
```bash
git remote remove origin
git remote add origin YOUR_REPO_URL
```

### **"Permission denied (publickey)"**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/job-search-dashboard.git
```

### **"Large files detected"**
```bash
# Remove large files
git rm --cached large-file.zip
git commit --amend
```

### **"Accidentally committed .env"**
```bash
# Remove from git
git rm --cached .env
git commit -m "Remove .env from git"

# Change all API keys immediately!
# Then push
git push
```

---

## ✅ Summary

**What you did:**
1. ✅ Cleaned up project
2. ✅ Created .env.example
3. ✅ Initialized git
4. ✅ Created GitHub repository
5. ✅ Pushed code to GitHub

**What's next:**
1. 🚀 Deploy to Railway
2. 🌐 Set up custom domain
3. 🎯 Start job searching!

**Your repository:**
```
https://github.com/YOUR_USERNAME/job-search-dashboard
```

🎉 **Congratulations! Your project is now on GitHub!**
