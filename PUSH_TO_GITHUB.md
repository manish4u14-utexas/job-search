# 🚀 Quick Guide: Push to GitHub

## ⚡ Quick Steps (5 minutes)

### **1. Clean Up (1 min)**
```bash
cd /Users/manishkumar/Library/CloudStorage/OneDrive-AlignTechnology,Inc/Desktop/job-search-dashboard
chmod +x cleanup.sh
./cleanup.sh
```

### **2. Create .env.example (1 min)**
```bash
cat > .env.example << 'EOF'
# LLM API Keys
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database
DATABASE_URL=file:./dev.db

# Environment
NODE_ENV=development
EOF
```

### **3. Initialize Git (1 min)**
```bash
git init
git add .
git commit -m "Initial commit: AI-powered job search dashboard"
```

### **4. Create GitHub Repo (1 min)**
1. Go to [github.com/new](https://github.com/new)
2. Name: `job-search-dashboard`
3. Private or Public
4. Click "Create repository"

### **5. Push to GitHub (1 min)**
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/job-search-dashboard.git
git branch -M main
git push -u origin main
```

## ✅ Done!

Your project is now on GitHub! 🎉

### **Next Steps:**

1. **Deploy to Railway** → See [DEPLOY_NOW.md](DEPLOY_NOW.md)
2. **Set up custom domain** → See [CUSTOM_DOMAIN_SETUP.md](CUSTOM_DOMAIN_SETUP.md)
3. **Start job searching!**

---

## 📋 What Was Cleaned Up

The cleanup script removed:
- ✅ 40+ old documentation files
- ✅ Temporary development files
- ✅ Build artifacts (dist/)
- ✅ Development database (dev.db)
- ✅ Logs (.manus-logs/)

**Kept important files:**
- ✅ README.md (main docs)
- ✅ Deployment guides
- ✅ Source code
- ✅ Configuration files

---

## 🔒 Security Check

Before pushing, verify:
- [ ] `.env` is NOT committed (check .gitignore)
- [ ] `.env.example` has NO real API keys
- [ ] No passwords in code

---

## 🎯 Repository URL

After pushing, your repo will be at:
```
https://github.com/YOUR_USERNAME/job-search-dashboard
```

Share this with:
- Railway (for deployment)
- Collaborators (if any)
- Your portfolio

---

**Need detailed instructions?** See [GITHUB_SETUP.md](GITHUB_SETUP.md)
