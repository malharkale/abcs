# Quick Start Guide for CallForFree

## ⚡ 5-Minute Local Setup

### Terminal 1: Backend
```bash
cd callforfree/backend
npm install
npm run dev
```

### Terminal 2: Frontend
```bash
cd callforfree/frontend
npm install
npm start
```

Visit `http://localhost:4200` - Done! 🎉

---

## 🚀 Deployment (Follow in Order)

### 1. **GitHub Setup** (5 minutes)

```bash
cd callforfree

git init
git add .
git commit -m "Initial commit"

# Go to github.com, create new repo "callforfree"
# Then:
git remote add origin https://github.com/YOUR_USERNAME/callforfree.git
git branch -M main
git push -u origin main
```

### 2. **Backend on Render** (10 minutes)

1. Visit [render.com](https://render.com)
2. Click "New Web Service"
3. Select your GitHub repo
4. Set:
   - Build: `cd backend && npm install`
   - Start: `cd backend && npm start`
5. Add env vars:
   - `NODE_ENV=production`
   - `PORT=3001`
6. Deploy!

Save the URL: `https://your-backend.onrender.com` ✅

### 3. **Frontend on Vercel** (5 minutes)

1. Visit [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Vercel auto-detects Angular
4. Add env var:
   - `VITE_BACKEND_URL=https://your-backend.onrender.com`
5. Deploy!

Your app is live! 🎊

### 4. **Update Backend Config** (1 minute)

Go back to Render backend settings:
- Add env var: `CLIENT_URL=https://your-frontend.vercel.app`
- Trigger redeploy

---

## 📝 Commands Cheatsheet

```bash
# Local Dev (from root)
npm run install:all    # Install everything
npm run dev            # Run backend + frontend

# Deployment (from root)
git add .
git commit -m "Your message"
git push               # Auto-deploys on Render & Vercel

# Troubleshooting
# Check running processes
netstat -ano | findstr :3001    # Windows
lsof -i :3001                    # Mac/Linux

# Kill process on port
taskkill /PID <number> /F        # Windows
kill -9 <PID>                    # Mac/Linux
```

---

## ✅ That's It!

You now have a production-ready video calling app deployed online! 🎉

Need help? Check the full [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
