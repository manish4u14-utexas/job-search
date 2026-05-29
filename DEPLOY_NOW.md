# 🚀 Deploy to Railway in 5 Minutes

## Quick Start Guide

### **Step 1: Push to GitHub (2 minutes)**

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create a new repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/job-search-dashboard.git
git branch -M main
git push -u origin main
```

### **Step 2: Deploy on Railway (3 minutes)**

1. **Go to:** [railway.app](https://railway.app)
2. **Sign up** with GitHub (free, no credit card needed)
3. Click **"Start a New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose **"job-search-dashboard"**
6. Railway will automatically deploy! 🎉

### **Step 3: Add Environment Variables**

In Railway dashboard:
1. Click on your project
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add these:

```bash
NODE_ENV=production
GROQ_API_KEY=your_groq_key_here
OPENAI_API_KEY=your_openai_key_here
```

### **Step 4: Add Persistent Storage (Optional but Recommended)**

1. In Railway dashboard, click **"+ New"**
2. Select **"Volume"**
3. Name it: `data`
4. Mount path: `/app/data`
5. Click **"Add"**

### **Step 5: Access Your App**

Railway will give you a URL like:
```
https://job-search-dashboard-production.up.railway.app
```

**Bookmark this URL!** You can now access your job search dashboard from anywhere! 🎉

---

## ✅ What's Already Configured

I've already set up these files for you:
- ✅ `nixpacks.toml` - Tells Railway to install Python + Node.js
- ✅ `.railwayignore` - Excludes unnecessary files
- ✅ Dynamic Python path - Works in both dev and production
- ✅ Build scripts - Ready to deploy

---

## 🔑 Where to Get API Keys

### **Groq (Free):**
1. Go to: [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Go to API Keys
4. Create new key
5. Copy and paste into Railway

### **OpenAI (Backup):**
1. Go to: [platform.openai.com](https://platform.openai.com)
2. Sign up
3. Go to API Keys
4. Create new key
5. Copy and paste into Railway

---

## 📱 After Deployment

### **Access from anywhere:**
- ✅ Your laptop
- ✅ Your phone (bookmark the URL)
- ✅ Work computer
- ✅ Any device with internet

### **Auto-updates:**
Whenever you push to GitHub, Railway automatically redeploys!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Railway auto-deploys! 🎉
```

---

## 💰 Cost

**Railway Free Tier:**
- $5 credit/month (free)
- Your app uses ~$2-3/month
- **Plenty for personal use!**

No credit card required for trial.

---

## 🚨 Troubleshooting

### **Build fails?**
- Check Railway logs in dashboard
- Verify `pnpm run build` works locally
- Make sure all dependencies are in `package.json`

### **App crashes?**
- Check environment variables are set
- Verify Python is installed (check logs)
- Make sure JobSpy is installed

### **Can't access app?**
- Check if deployment is complete (green checkmark)
- Click on "Deployments" tab to see status
- Check logs for errors

---

## 🎉 You're Done!

Your job search dashboard is now:
- ✅ Live on the internet
- ✅ Accessible from anywhere
- ✅ Automatically backed up
- ✅ Auto-deploys on updates
- ✅ Secure (HTTPS)
- ✅ Free!

**Start your job search! 🚀**

---

## 📞 Quick Links

- **Railway Dashboard:** [railway.app/dashboard](https://railway.app/dashboard)
- **GitHub Repo:** Your repo URL
- **Your App:** Railway will provide the URL

---

## 🔄 Daily Usage

1. **Open your app URL** (bookmark it!)
2. **Search for jobs** (Indeed/LinkedIn)
3. **Apply to matches** (with tailored resumes)
4. **Track applications** (viewed/applied indicators)
5. **Repeat daily!**

**Good luck with your job search! 🌟**
