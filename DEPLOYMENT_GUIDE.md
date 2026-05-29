# 🚀 Deployment Guide - Easiest Options for Personal Use

## 🎯 Recommended: Railway (Easiest & Free)

**Why Railway?**
- ✅ **Completely FREE** for personal use ($5 credit/month)
- ✅ **One-click deploy** from GitHub
- ✅ **Automatic HTTPS** (secure)
- ✅ **Persistent storage** for SQLite database
- ✅ **Python support** (for JobSpy)
- ✅ **Environment variables** management
- ✅ **Auto-deploy** on git push
- ✅ **No credit card** required for trial

**Perfect for:** Daily personal use, always accessible from any device

---

## Option 1: Railway (RECOMMENDED) ⭐

### **Step 1: Prepare Your Project**

1. **Create `.railwayignore` file:**
```bash
cat > .railwayignore << 'EOF'
node_modules
.git
*.md
dev.db
.env.local
EOF
```

2. **Create `railway.json` config:**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm run build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

3. **Update `package.json` scripts:**
```json
{
  "scripts": {
    "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "railway:build": "pnpm install && pnpm run build",
    "railway:start": "node dist/index.js"
  }
}
```

### **Step 2: Push to GitHub**

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create GitHub repo and push
# (Create repo on github.com first)
git remote add origin https://github.com/YOUR_USERNAME/job-search-dashboard.git
git branch -M main
git push -u origin main
```

### **Step 3: Deploy on Railway**

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `job-search-dashboard` repo
5. Railway will auto-detect Node.js and deploy!

### **Step 4: Configure Environment Variables**

In Railway dashboard:
1. Click on your project
2. Go to **"Variables"** tab
3. Add these variables:

```bash
NODE_ENV=production
PORT=3000

# Your LLM API Keys
GROQ_API_KEY=your_groq_key_here
OPENAI_API_KEY=your_openai_key_here

# Database (Railway provides persistent volume)
DATABASE_URL=file:/app/data/dev.db
```

### **Step 5: Add Persistent Storage**

1. In Railway dashboard, click **"+ New"**
2. Select **"Volume"**
3. Mount path: `/app/data`
4. This ensures your SQLite database persists across deploys

### **Step 6: Install Python for JobSpy**

Create `nixpacks.toml` in project root:
```toml
[phases.setup]
nixPkgs = ["nodejs_20", "python311", "python311Packages.pip"]

[phases.install]
cmds = [
  "npm install -g pnpm",
  "pnpm install",
  "pip install jobspy"
]

[phases.build]
cmds = ["pnpm run build"]

[start]
cmd = "node dist/index.js"
```

### **Step 7: Access Your App**

Railway will give you a URL like:
```
https://job-search-dashboard-production.up.railway.app
```

**Done! Your app is live! 🎉**

---

## Option 2: Render (Also Easy & Free)

**Why Render?**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy deployment
- ❌ Spins down after 15 min inactivity (free tier)
- ❌ Slower cold starts

### **Quick Deploy:**

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: job-search-dashboard
    env: node
    buildCommand: pnpm install && pnpm run build
    startCommand: node dist/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: GROQ_API_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false
```

2. Push to GitHub
3. Go to [render.com](https://render.com)
4. Click **"New +"** → **"Web Service"**
5. Connect your GitHub repo
6. Render auto-deploys!

---

## Option 3: Local Server (Always Running)

**Why Local?**
- ✅ **Completely free**
- ✅ **Full control**
- ✅ **No deployment needed**
- ❌ Only accessible from your computer
- ❌ Computer must be on

### **Setup:**

1. **Build the project:**
```bash
pnpm run build
```

2. **Create start script:**

**macOS/Linux** (`start.sh`):
```bash
#!/bin/bash
cd /Users/manishkumar/Library/CloudStorage/OneDrive-AlignTechnology,Inc/Desktop/job-search-dashboard
NODE_ENV=production node dist/index.js
```

**Windows** (`start.bat`):
```batch
@echo off
cd C:\path\to\job-search-dashboard
set NODE_ENV=production
node dist\index.js
```

3. **Make it executable:**
```bash
chmod +x start.sh
```

4. **Run on startup (macOS):**

Create `~/Library/LaunchAgents/com.jobsearch.dashboard.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.jobsearch.dashboard</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/manishkumar/Library/CloudStorage/OneDrive-AlignTechnology,Inc/Desktop/job-search-dashboard/start.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load it:
```bash
launchctl load ~/Library/LaunchAgents/com.jobsearch.dashboard.plist
```

5. **Access at:** `http://localhost:3000`

---

## Option 4: Docker (For Advanced Users)

### **Create `Dockerfile`:**

```dockerfile
FROM node:20-alpine

# Install Python for JobSpy
RUN apk add --no-cache python3 py3-pip

# Install JobSpy
RUN pip3 install jobspy

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy project files
COPY . .

# Build
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start
CMD ["node", "dist/index.js"]
```

### **Create `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GROQ_API_KEY=${GROQ_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

### **Deploy:**

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📊 Comparison Table

| Option | Cost | Ease | Accessibility | Uptime | Best For |
|--------|------|------|---------------|--------|----------|
| **Railway** | Free | ⭐⭐⭐⭐⭐ | Anywhere | 24/7 | **RECOMMENDED** |
| **Render** | Free | ⭐⭐⭐⭐ | Anywhere | 24/7* | Good alternative |
| **Local** | Free | ⭐⭐⭐ | Local only | When PC on | Testing |
| **Docker** | Free | ⭐⭐ | Depends | 24/7 | Advanced users |

*Render free tier spins down after 15 min inactivity

---

## 🎯 My Recommendation for You

### **Use Railway** because:

1. ✅ **Easiest setup** (5 minutes)
2. ✅ **Always accessible** (from phone, work computer, anywhere)
3. ✅ **Free for personal use** ($5 credit/month is plenty)
4. ✅ **Automatic HTTPS** (secure)
5. ✅ **Auto-deploy** (push to GitHub → auto updates)
6. ✅ **Persistent database** (your data is safe)
7. ✅ **Python support** (JobSpy works out of the box)

### **Quick Start with Railway:**

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main

# 2. Go to railway.app
# 3. Click "Deploy from GitHub"
# 4. Select your repo
# 5. Add environment variables
# 6. Done! 🎉
```

**Your app will be live at:** `https://your-app.up.railway.app`

---

## 🔧 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] `.env` file is NOT committed (add to `.gitignore`)
- [ ] All API keys are ready (Groq, OpenAI)
- [ ] Python 3.11 is specified in deployment config
- [ ] JobSpy is installed in deployment
- [ ] Database path is configured for production
- [ ] Build script works locally (`pnpm run build`)
- [ ] Start script works locally (`pnpm start`)

---

## 🚨 Important Notes

### **1. Environment Variables**

Never commit these to GitHub:
```bash
GROQ_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

Add them in Railway/Render dashboard instead.

### **2. Database**

Your SQLite database needs persistent storage:
- **Railway:** Use Volume (mount to `/app/data`)
- **Render:** Use Persistent Disk
- **Local:** Already persistent

### **3. Python Path**

Update `server/job-fetcher.ts` for production:
```typescript
// Development (local)
const command = `/opt/homebrew/bin/python3.11 "${scriptPath}" ...`;

// Production (Railway/Render)
const command = `python3 "${scriptPath}" ...`;
```

Or make it dynamic:
```typescript
const pythonPath = process.env.NODE_ENV === 'production' 
  ? 'python3' 
  : '/opt/homebrew/bin/python3.11';
const command = `${pythonPath} "${scriptPath}" ...`;
```

### **4. Port Configuration**

Railway/Render provide `PORT` environment variable:
```typescript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 📱 Access Your Deployed App

Once deployed, you can access from:
- ✅ Your laptop
- ✅ Your phone
- ✅ Work computer
- ✅ Anywhere with internet

**Bookmark the URL for easy access!**

---

## 🔄 Updating Your Deployed App

### **Railway (Auto-deploy):**
```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push

# Railway automatically deploys! 🎉
```

### **Manual Deploy:**
```bash
# Rebuild locally
pnpm run build

# Restart service
# (Railway/Render have restart buttons in dashboard)
```

---

## 💰 Cost Estimate

### **Railway Free Tier:**
- $5 credit/month
- Your app uses ~$2-3/month
- **Plenty for personal use!**

### **If you exceed free tier:**
- Upgrade to Hobby plan: $5/month
- Still very affordable

### **Render Free Tier:**
- Completely free
- Spins down after 15 min inactivity
- 30 sec cold start

---

## 🎉 Next Steps

1. **Choose deployment option** (I recommend Railway)
2. **Follow the setup steps** (5-10 minutes)
3. **Add environment variables** (API keys)
4. **Deploy!**
5. **Bookmark your app URL**
6. **Start your job search!**

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Docker Documentation](https://docs.docker.com)

---

## ❓ Need Help?

If you run into issues:
1. Check Railway/Render logs
2. Verify environment variables
3. Test build locally first (`pnpm run build`)
4. Check Python/JobSpy installation

**You're ready to deploy! 🚀**
