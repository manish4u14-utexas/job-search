# 🌐 Custom Domain Setup: job-search.sprintpulse.ai

## ✅ Yes, You Can Use Your Domain!

Since you already own **sprintpulse.ai** on Cloudflare, you can easily set up:
```
job-search.sprintpulse.ai
```

**Cost:** FREE (you already own the domain)

---

## 🎯 Best Option: Railway + Cloudflare

### **Why This Works:**
- ✅ Deploy app on Railway (free)
- ✅ Point subdomain to Railway (free)
- ✅ Cloudflare handles DNS (free)
- ✅ Automatic HTTPS (free)
- ✅ Professional URL (your domain)

**Total Cost:** $0 (Railway free tier + domain you already own)

---

## 📋 Step-by-Step Setup

### **Step 1: Deploy on Railway (5 minutes)**

Follow the Railway deployment guide:
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main

# Deploy on Railway
1. Go to railway.app
2. Deploy from GitHub
3. Select your repo
4. Add environment variables
```

Railway will give you a default URL like:
```
https://job-search-dashboard-production.up.railway.app
```

---

### **Step 2: Add Custom Domain in Railway (2 minutes)**

1. **In Railway Dashboard:**
   - Click on your project
   - Go to **"Settings"** tab
   - Scroll to **"Domains"** section
   - Click **"+ Custom Domain"**

2. **Enter your subdomain:**
   ```
   job-search.sprintpulse.ai
   ```

3. **Railway will show you DNS records:**
   ```
   Type: CNAME
   Name: job-search
   Value: job-search-dashboard-production.up.railway.app
   ```

---

### **Step 3: Configure Cloudflare DNS (3 minutes)**

1. **Go to Cloudflare Dashboard:**
   - Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Select **sprintpulse.ai** domain

2. **Add DNS Record:**
   - Click **"DNS"** in left menu
   - Click **"Add record"**
   - Fill in:
     ```
     Type: CNAME
     Name: job-search
     Target: job-search-dashboard-production.up.railway.app
     Proxy status: Proxied (orange cloud) ✅
     TTL: Auto
     ```
   - Click **"Save"**

3. **Wait 1-5 minutes** for DNS propagation

---

### **Step 4: Verify Setup (1 minute)**

1. **Check DNS propagation:**
   ```bash
   # In terminal
   nslookup job-search.sprintpulse.ai
   ```

2. **Visit your domain:**
   ```
   https://job-search.sprintpulse.ai
   ```

3. **Should see your app!** 🎉

---

## 🔒 HTTPS/SSL Setup

**Automatic!** Both Railway and Cloudflare provide free SSL:

1. **Railway:** Provides SSL certificate automatically
2. **Cloudflare:** Provides additional SSL/TLS encryption
3. **Result:** Your app is fully secure (HTTPS)

**No configuration needed!**

---

## 🎨 Cloudflare Benefits

Since you're using Cloudflare, you get extra benefits:

### **1. DDoS Protection**
- ✅ Automatic protection against attacks
- ✅ Free on all plans

### **2. CDN (Content Delivery Network)**
- ✅ Faster loading worldwide
- ✅ Cached static assets

### **3. Analytics**
- ✅ See visitor stats
- ✅ Traffic insights

### **4. Firewall Rules**
- ✅ Block specific countries/IPs
- ✅ Rate limiting

### **5. Page Rules**
- ✅ Custom caching rules
- ✅ Redirects

**All FREE with Cloudflare!**

---

## 💰 Cost Breakdown

| Item | Cost |
|------|------|
| Domain (sprintpulse.ai) | Already owned ✅ |
| Subdomain (job-search) | FREE ✅ |
| Railway hosting | FREE ($5 credit) ✅ |
| Cloudflare DNS | FREE ✅ |
| SSL Certificate | FREE ✅ |
| CDN | FREE ✅ |
| **Total** | **$0/month** 🎉 |

---

## 🔧 Cloudflare DNS Configuration

### **Recommended Settings:**

```
┌─────────────────────────────────────────────────────┐
│ DNS Record Configuration                            │
├─────────────────────────────────────────────────────┤
│ Type:    CNAME                                      │
│ Name:    job-search                                 │
│ Target:  job-search-dashboard-production.up.railway.app │
│ Proxy:   ✅ Proxied (orange cloud)                  │
│ TTL:     Auto                                       │
└─────────────────────────────────────────────────────┘
```

### **Why "Proxied" (Orange Cloud)?**

✅ **Enable Proxy (Recommended):**
- ✅ DDoS protection
- ✅ CDN caching
- ✅ Cloudflare SSL
- ✅ Analytics
- ✅ Firewall rules

❌ **DNS Only (Gray Cloud):**
- ❌ No DDoS protection
- ❌ No CDN
- ❌ No Cloudflare features
- ✅ Slightly faster DNS (but not worth it)

**Use Orange Cloud (Proxied)!**

---

## 🚀 Alternative: Cloudflare Pages + Railway

You could also split your app:

### **Option A: All on Railway (Recommended)**
```
Frontend + Backend on Railway
↓
job-search.sprintpulse.ai → Railway
```
- ✅ Simplest setup
- ✅ One deployment
- ✅ Everything in one place

### **Option B: Split Architecture**
```
Frontend on Cloudflare Pages (free)
Backend on Railway (free)
↓
job-search.sprintpulse.ai → Cloudflare Pages
api.sprintpulse.ai → Railway
```
- ⚠️ More complex
- ⚠️ Two deployments
- ⚠️ CORS configuration needed
- ✅ Slightly faster frontend

**Recommendation: Use Option A (all on Railway)**

---

## 📝 Complete Setup Example

### **1. Railway Deployment:**
```bash
# Deploy to Railway
git push origin main

# Railway URL:
https://job-search-dashboard-production.up.railway.app
```

### **2. Railway Custom Domain:**
```
In Railway Dashboard:
Settings → Domains → Add Custom Domain
Enter: job-search.sprintpulse.ai
```

### **3. Cloudflare DNS:**
```
In Cloudflare Dashboard:
DNS → Add Record
Type: CNAME
Name: job-search
Target: job-search-dashboard-production.up.railway.app
Proxy: ON (orange cloud)
```

### **4. Access Your App:**
```
https://job-search.sprintpulse.ai
```

**Done! 🎉**

---

## 🔍 Troubleshooting

### **"DNS_PROBE_FINISHED_NXDOMAIN" Error**

**Cause:** DNS not propagated yet

**Solution:**
1. Wait 5-10 minutes
2. Clear browser cache
3. Try incognito mode
4. Check DNS: `nslookup job-search.sprintpulse.ai`

### **"Too Many Redirects" Error**

**Cause:** SSL/TLS mode mismatch

**Solution:**
1. Go to Cloudflare Dashboard
2. SSL/TLS → Overview
3. Set to **"Full"** or **"Full (strict)"**
4. Wait 1 minute

### **"502 Bad Gateway" Error**

**Cause:** Railway app not running

**Solution:**
1. Check Railway dashboard
2. View deployment logs
3. Ensure app is running
4. Check environment variables

### **Domain Not Working**

**Checklist:**
- [ ] DNS record added in Cloudflare
- [ ] Custom domain added in Railway
- [ ] DNS propagated (wait 5-10 min)
- [ ] Railway app is running
- [ ] SSL/TLS mode is "Full"

---

## 🎯 Recommended Cloudflare Settings

### **SSL/TLS:**
```
Mode: Full (strict)
Edge Certificates: On
Always Use HTTPS: On
Minimum TLS Version: 1.2
```

### **Speed:**
```
Auto Minify: JS, CSS, HTML
Brotli: On
Early Hints: On
HTTP/2: On
HTTP/3 (with QUIC): On
```

### **Caching:**
```
Caching Level: Standard
Browser Cache TTL: 4 hours
```

### **Security:**
```
Security Level: Medium
Challenge Passage: 30 minutes
Browser Integrity Check: On
```

---

## 📊 Benefits of Custom Domain

### **Professional:**
- ✅ `job-search.sprintpulse.ai` (professional)
- ❌ `job-search-dashboard-production.up.railway.app` (ugly)

### **Branding:**
- ✅ Your domain, your brand
- ✅ Easy to remember
- ✅ Easy to share

### **Flexibility:**
- ✅ Can move to different host later
- ✅ Keep same URL
- ✅ No broken links

### **SEO:**
- ✅ Better for search engines
- ✅ Custom domain looks more trustworthy

---

## 🎉 Final Setup

After setup, you'll have:

```
┌─────────────────────────────────────────────────────┐
│ Your Job Search Dashboard                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│ URL: https://job-search.sprintpulse.ai             │
│                                                     │
│ ✅ Custom domain (your brand)                       │
│ ✅ HTTPS/SSL (secure)                               │
│ ✅ DDoS protection (Cloudflare)                     │
│ ✅ CDN (fast worldwide)                             │
│ ✅ Always accessible (24/7)                         │
│ ✅ Auto-deploy (push to GitHub)                     │
│ ✅ Free hosting (Railway)                           │
│                                                     │
│ Total Cost: $0/month 🎉                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Checklist

- [ ] Deploy app on Railway
- [ ] Add custom domain in Railway
- [ ] Add CNAME record in Cloudflare
- [ ] Enable proxy (orange cloud)
- [ ] Set SSL/TLS to "Full"
- [ ] Wait 5-10 minutes
- [ ] Visit https://job-search.sprintpulse.ai
- [ ] Bookmark and use! 🎉

---

## 💡 Pro Tips

### **1. Use Subdomain for Testing:**
```
test.sprintpulse.ai → Railway staging
job-search.sprintpulse.ai → Railway production
```

### **2. Set Up Email Forwarding:**
```
jobs@sprintpulse.ai → your-email@gmail.com
```
(Cloudflare Email Routing - FREE)

### **3. Add More Subdomains:**
```
job-search.sprintpulse.ai → Job search dashboard
resume.sprintpulse.ai → Resume builder
portfolio.sprintpulse.ai → Your portfolio
```

All FREE with your domain!

---

## 📚 Resources

- **Railway Custom Domains:** [docs.railway.app/deploy/custom-domains](https://docs.railway.app/deploy/custom-domains)
- **Cloudflare DNS:** [developers.cloudflare.com/dns](https://developers.cloudflare.com/dns)
- **Cloudflare SSL:** [developers.cloudflare.com/ssl](https://developers.cloudflare.com/ssl)

---

## ✅ Summary

**Yes, you can use your domain!**

1. ✅ Deploy on Railway (free)
2. ✅ Add custom domain in Railway
3. ✅ Add CNAME in Cloudflare
4. ✅ Access at job-search.sprintpulse.ai
5. ✅ Total cost: $0/month

**Your professional job search dashboard will be live at:**
```
https://job-search.sprintpulse.ai
```

**Setup time: 10 minutes**
**Cost: FREE**

🎉 **Perfect solution for you!**
