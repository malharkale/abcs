# DEPLOYMENT_COMMANDS.md - Copy & Paste Ready Commands

## 🚀 Phase 1: Local Testing (5 minutes)

### Terminal 1 - Backend
```bash
cd c:\Users\Lenovo\Desktop\callforfree\backend
npm install
npm run dev
```

Expected output:
```
🚀 CallForFree Backend Server
📍 Server running on port 3001
🌐 URL: http://localhost:3001
✅ Ready to accept connections
```

### Terminal 2 - Frontend
```bash
cd c:\Users\Lenovo\Desktop\callforfree\frontend
npm install
npm start
```

Visit: http://localhost:4200

---

## 📌 Phase 2: GitHub Setup (5 minutes)

### From `c:\Users\Lenovo\Desktop\callforfree` directory:

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit: CallForFree production-ready video calling app"

# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/callforfree.git
git branch -M main
git push -u origin main
```

Verify on GitHub that all files uploaded ✅

---

## 🌩️ Phase 3: Deploy Backend to Render (10 minutes)

### Manual Steps on Render Dashboard:

1. Visit: https://render.com/dashboard
2. Click: **"New +"** → **"Web Service"**
3. Click: **"Connect account"** (GitHub)
4. Select: `callforfree` repository
5. Fill form:
   ```
   Name: callforfree-backend
   Environment: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   Plan: Free
   ```
6. Click: **"Add Environment Variable"**
   ```
   NODE_ENV = production
   PORT = 3001
   CLIENT_URL = (leave blank, will update later)
   ```
7. Click: **"Create Web Service"**

Wait 5-10 minutes for deployment...

### When deployment finishes:

- Note your backend URL: `https://callforfree-backend.onrender.com`
- Test it: Visit `https://callforfree-backend.onrender.com/health`
- Should show: `{"status":"OK",...}`

---

## ✨ Phase 4: Deploy Frontend to Vercel (5 minutes)

### Manual Steps on Vercel Dashboard:

1. Visit: https://vercel.com/dashboard
2. Click: **"Add New..."** → **"Project"**
3. Click: **"Import Git Repository"**
4. Search: `callforfree`
5. Click: **"Import"**
6. Vercel auto-detects Angular settings ✅
7. Click: **"Add Environment Variable"**
   ```
   Name: VITE_BACKEND_URL
   Value: https://callforfree-backend.onrender.com
   Environments: Production
   ```
8. Click: **"Deploy"**

Wait 3-5 minutes for build...

### When deployment finishes:

- Note your frontend URL: `https://callforfree-xxxxx.vercel.app`
- Test it: Visit your URL
- Should show: CallForFree home page

---

## 🔄 Phase 5: Update Backend with Frontend URL (1 minute)

### Back on Render Dashboard:

1. Select: `callforfree-backend`
2. Go to: **"Environment"**
3. Edit: `CLIENT_URL`
4. Set to: `https://callforfree-xxxxx.vercel.app` (your Vercel URL)
5. Click: **"Save"**
6. Wait for automatic redeploy (2-3 minutes)

---

## ✅ Phase 6: Full End-to-End Test

1. Open frontend URL: `https://callforfree-xxxxx.vercel.app`
2. Create a room (note Room ID)
3. Open new private/incognito window
4. Join same room using Room ID
5. Test video and audio ✅

---

## 📝 For Future Code Changes

Every time you push code:

```bash
# From c:\Users\Lenovo\Desktop\callforfree directory

git add .
git commit -m "Your change description"
git push
```

Both systems auto-redeploy within 2-5 minutes:
- Backend redeploys on Render
- Frontend rebuilds on Vercel

**No manual action needed!** ✅

---

## 🛠️ Troubleshooting Commands

### Check if backend is running locally
```bash
# Windows
netstat -ano | findstr :3001

# Mac/Linux
lsof -i :3001
```

### Kill process on port 3001
```bash
# Windows
taskkill /PID 12345 /F

# Mac/Linux
kill -9 12345
```

### Clear and reinstall dependencies
```bash
# Backend
cd backend
rmdir /s node_modules (Windows) or rm -rf node_modules (Mac/Linux)
npm install

# Frontend
cd frontend
rmdir /s node_modules (Windows) or rm -rf node_modules (Mac/Linux)
npm install
```

### Check backend health
```bash
# Local
curl http://localhost:3001/health

# Production
curl https://callforfree-backend.onrender.com/health
```

---

## 📊 Monitoring

### Backend Logs (Render)
Visit: https://dashboard.render.com/ → Select service → **"Logs"** tab

### Frontend Logs (Vercel)
Visit: https://vercel.com/dashboard → Select project → **"Deployments"** tab

### Performance Metrics
- **Render**: Dashboard → Metrics
- **Vercel**: Dashboard → Analytics

---

## 🎉 You're Done!

Your CallForFree application is now:
- ✅ Running locally (http://localhost:4200)
- ✅ Deployed on Render (backend)
- ✅ Deployed on Vercel (frontend)
- ✅ Auto-updating with Git commits
- ✅ Production-ready

Share your Vercel URL with anyone to use! 📞✨

---

## Quick Reference URLs

| Service | Workspace | URL |
|---------|-----------|-----|
| Local Frontend | `http://localhost:4200` | - |
| Local Backend | `http://localhost:3001` | - |
| Render Dashboard | - | https://render.com/dashboard |
| Vercel Dashboard | - | https://vercel.com/dashboard |
| GitHub Backend | callforfree/backend/ | https://github.com/YOUR_USERNAME/callforfree |
| GitHub Frontend | callforfree/frontend/ | https://github.com/YOUR_USERNAME/callforfree |

---

## 📞 Support Resources

- **Express**: https://expressjs.com/
- **Angular**: https://angular.io/docs
- **Socket.IO**: https://socket.io/docs/
- **WebRTC**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
