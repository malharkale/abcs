# Setup Instructions for CallForFree

## Prerequisites

Before you begin, make sure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- A **GitHub** account
- **Vercel** account (for frontend deployment) - [Sign up](https://vercel.com)
- **Render** account (for backend deployment) - [Sign up](https://render.com)

---

## Part 1: Local Development Setup

### Step 1: Navigate to Project Directory

```bash
cd c:\Users\Lenovo\Desktop\callforfree
```

### Step 2: Install Dependencies

**Option A: Using the root package.json**

```bash
npm run install:all
```

**Option B: Manually install each part**

```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### Step 3: Run Backend (Terminal 1)

```bash
cd backend
npm run dev
```

You should see:
```
🚀 CallForFree Backend Server
📍 Server running on port 3001
✅ Ready to accept connections
```

### Step 4: Run Frontend (Terminal 2)

```bash
cd frontend
npm start
```

You should see the Angular CLI starting and a message about the dev server running on `http://localhost:4200`

### Step 5: Open in Browser

Go to `http://localhost:4200` and test locally:

1. Create a room (note the Room ID)
2. Open another browser tab/window or private window
3. Enter the Room ID and join
4. Test video and audio

---

## Part 2: Git Setup and Repository

### Step 1: Initialize Git Repository

```bash
cd c:\Users\Lenovo\Desktop\callforfree
git init
git add .
git commit -m "Initial commit: Full production-ready video calling app"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name it: `callforfree`
4. Don't initialize with README (we have one)
5. Click "Create repository"

### Step 3: Add Remote and Push

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/callforfree.git
git branch -M main
git push -u origin main
```

Verify on GitHub that all code is uploaded.

---

## Part 3: Deploy Backend to Render

### Step 1: Prepare Backend Configuration

Update `backend/.env.production`:

```bash
PORT=3001
NODE_ENV=production
CLIENT_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
```

Replace `YOUR-VERCEL-DOMAIN` with your Vercel deployment URL (you'll get this after frontend deployment).

Commit this change:

```bash
git add backend/.env.production
git commit -m "Update backend production config"
git push
```

### Step 2: Create Render Service

1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Click "Connect account" (authorize GitHub)
4. Select `callforfree` repository
5. Configure:
   - **Name**: `callforfree-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free tier (okay for testing)

### Step 3: Add Environment Variables on Render

1. Scroll to "Environment Variables" section
2. Add:
   - **Key**: `NODE_ENV` → **Value**: `production`
   - **Key**: `PORT` → **Value**: `3001`
   - **Key**: `CLIENT_URL` → **Value**: `https://YOUR-VERCEL-DOMAIN.vercel.app`

3. Click "Create Web Service"

Wait for deployment to complete (5-10 minutes).

Once deployed, you'll get a URL like: `https://callforfree-backend.onrender.com`

Save this URL - you need it for frontend deployment!

---

## Part 4: Deploy Frontend to Vercel

### Step 1: Update Frontend Configuration

Update `frontend/.env.production`:

```bash
VITE_BACKEND_URL=https://callforfree-backend.onrender.com
```

(Replace with actual Render URL from previous step)

Commit and push:

```bash
git add frontend/.env.production
git commit -m "Update frontend production config with backend URL"
git push
```

### Step 2: Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Search for `callforfree` and import
5. Configure build settings:
   - **Framework**: `Angular`
   - **Build Command**: Will auto-detect (should be `npm run build`)
   - **Output Directory**: `dist/callforfree`
   - **Install Command**: `npm install`

6. Add Environment Variables:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://callforfree-backend.onrender.com`

7. Click "Deploy"

Wait for build to complete (3-5 minutes).

Your frontend URL will be something like: `https://callforfree-123abc.vercel.app`

---

## Part 5: Update Backend with Frontend URL

Now that you have the frontend URL:

1. Go back to [Render Dashboard](https://dashboard.render.com)
2. Select `callforfree-backend`
3. Go to "Environment"
4. Edit `CLIENT_URL` to your Vercel URL: `https://callforfree-123abc.vercel.app`
5. Trigger a manual redeploy

---

## Part 6: Test Production Deployment

1. Open your Vercel frontend URL in browser
2. Create a room
3. Open another browser/tab
4. Join the room using the Room ID
5. Test video and audio

---

## Troubleshooting

### Backend won't start

```bash
# Check if port 3001 is already in use
# Windows
netstat -ano | findstr :3001

# Kill the process using that port
taskkill /PID <PID> /F
```

### Frontend won't compile

```bash
# Clear node_modules and reinstall
cd frontend
rm -r node_modules
npm install
npm start
```

### Connection issues in production

- Verify `CLIENT_URL` in backend `.env.production`
- Verify `VITE_BACKEND_URL` in frontend `.env.production`
- Check Render and Vercel deployment logs
- Ensure CORS is properly configured

### "Room Full" immediately

- Verify you're using different rooms for new tests
- Check browser console for errors
- Verify backend is running

---

## Continuous Deployment

Once set up, any push to `main` branch triggers:

1. Backend redeploy on Render automatically
2. Frontend rebuild on Vercel automatically

No need to manually redeploy!

---

## Command Reference

### Local Development

```bash
# Root directory setup
npm run install:all          # Install all dependencies
npm run dev                  # Run backend + frontend together

# Backend only
cd backend
npm run dev                  # Development mode with auto-reload
npm start                    # Production mode

# Frontend only
cd frontend
npm start                    # Development server
npm run build               # Build for production
ng serve                    # Alternative: Direct ng command
```

### Git Commands

```bash
git status                  # Check changes
git add .                  # Stage all changes
git commit -m "message"    # Commit changes
git push                   # Push to GitHub
git pull                   # Pull from GitHub
```

### Monitoring

```bash
# Local backend logs
curl http://localhost:3001/health

# Production backend health
curl https://your-backend-url.onrender.com/health

# Check status
curl https://your-backend-url.onrender.com/status
```

---

## Security Checklist

- [ ] `.env` files are in `.gitignore` (already done)
- [ ] `node_modules` is in `.gitignore` (already done)
- [ ] Backend environment variables set on Render
- [ ] Frontend environment variables set on Vercel
- [ ] CLIENT_URL updated in backend production config
- [ ] Backend URL updated in frontend production config

---

## Next Steps

1. **Monitor** - Check Render and Vercel dashboards regularly
2. **Scale** - Upgrade Render plan if needed for production use
3. **Customize** - Add authentication, database, analytics
4. **Optimize** - Add error tracking (Sentry), analytics (Mixpanel)
5. **Domain** - Connect custom domain to Vercel

---

## Support & Resources

- **Frontend Issues**: Check Angular docs at angular.io
- **Backend Issues**: Check Express docs at expressjs.com
- **WebRTC**: MDN Web Docs - WebRTC
- **Socket.IO**: socket.io documentation
- **Deployment**: Check Render and Vercel docs

---

**Congratulations! Your CallForFree application is now live! 🎉**
