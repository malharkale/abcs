# Deployment Guide for CallForFree

## Prerequisites

- GitHub account and repository with code pushed
- Render account (render.com)
- Vercel account (vercel.com)

---

## Step-by-Step Deployment

### Phase 1: Prepare Code

#### 1.1 Create GitHub Repository

```bash
cd callforfree

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: CallForFree video calling app"

# Create repository on GitHub.com
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/callforfree.git
git branch -M main
git push -u origin main
```

#### 1.2 Verify Code Structure

Make sure your repository has:
```
callforfree/
├── backend/
│   ├── src/index.js
│   ├── package.json
│   └── .env.production
├── frontend/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── .env.production
├── package.json
├── README.md
└── SETUP_INSTRUCTIONS.md
```

---

### Phase 2: Deploy Backend to Render

#### 2.1 Create Service on Render

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Select **"Connect account"** (authorize GitHub)
4. Select your **`callforfree`** repository
5. Click **"Connect"**

#### 2.2 Configure Service

Fill in the form:

| Field | Value |
|-------|-------|
| Name | `callforfree-backend` |
| Environment | `Node` |
| Build Command | `cd backend && npm install` |
| Start Command | `cd backend && npm start` |
| Plan | Free |

#### 2.3 Add Environment Variables

Click **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `CLIENT_URL` | [Leave blank for now] |

#### 2.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. **Copy the URL** when deployment completes
   - Example: `https://callforfree-backend.onrender.com`

#### 2.5 Verify Backend

Open in browser:
```
https://callforfree-backend.onrender.com/health
```

Should see:
```json
{
  "status": "OK",
  "timestamp": "2026-03-09T..."
}
```

---

### Phase 3: Deploy Frontend to Vercel

#### 3.1 Import Project on Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Search for and select **`callforfree`**
5. Click **"Import"**

#### 3.2 Configure Build

Vercel should auto-detect Angular. Verify:

| Field | Value |
|-------|-------|
| Framework | Angular |
| Build Command | `npm run build` |
| Output Directory | `dist/callforfree` |
| Install Command | `npm install` |
| Root Directory | `./frontend` |

#### 3.3 Add Environment Variables

Click **"Add Environment Variable"**:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_BACKEND_URL` | `https://callforfree-backend.onrender.com` | Production |

#### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (3-5 minutes)
3. **Copy the URL** when deployment completes
   - Example: `https://callforfree-123abc.vercel.app`

#### 3.5 Verify Frontend

Open your Vercel URL in browser. Should show the CallForFree home page.

---

### Phase 4: Update Backend with Frontend URL

#### 4.1 Update Environment Variable

Now that frontend is deployed, update backend:

1. Go back to https://dashboard.render.com/
2. Select **`callforfree-backend`**
3. Click **"Environment"**
4. Edit **`CLIENT_URL`**:
   - Set to: `https://callforfree-123abc.vercel.app`
5. Click **"Save"**

#### 4.2 Trigger Redeploy

1. Click **"Deploys"**
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for redeploy (2-3 minutes)

---

### Phase 5: Test Production Setup

#### 5.1 Test Web App

1. Open your Vercel URL in browser
2. Click **"Create Room"**
3. Note the Room ID
4. Open a new tab (or incognito window)
5. Enter the Room ID and click **"Join Room"**
6. Test video/audio functionality

#### 5.2 Test Connectivity

From browser console:

```javascript
// Should show active connections
fetch('https://callforfree-backend.onrender.com/status').then(r => r.json()).then(d => console.log(d))
```

---

## Post-Deployment

### Continuous Deployment (Auto-Deploy)

- **Backend**: Any push to `main` triggers Render redeploy
- **Frontend**: Any push to `main` triggers Vercel rebuild

### To Deploy Your Changes

```bash
# Make changes locally
# Test locally: npm run dev

# Commit and push
git add .
git commit -m "Your change description"
git push

# Both will automatically redeploy in a few minutes
```

---

## Monitoring & Scaling

### Monitor Render Backend

1. Go to https://dashboard.render.com/
2. Select `callforfree-backend`
3. Check **"Logs"** tab for errors
4. Monitor **"Metrics"** for CPU/Memory

### Monitor Vercel Frontend

1. Go to https://vercel.com/dashboard
2. Select `callforfree`
3. Check **"Deployments"** tab
4. View **"Analytics"** for usage

### Scale Services

- **Render**: Upgrade from Free to Pro plan ($7/month)
  - Higher CPU/Memory limits
  - Faster deploys
  - Better uptime

- **Vercel**: Upgrade to Pro plan ($20/month)
  - Higher concurrency
  - Priority support
  - Analytics

---

## Troubleshooting Deployment

### Backend won't deploy

**Error**: `Command exited with non-zero exit code`

**Solution**:
1. Check `backend/package.json` has all dependencies
2. Verify `backend/src/index.js` exists
3. Try triggering manual deploy from Render dashboard
4. Check build logs for specific errors

### Frontend build fails

**Error**: `npm not found` or build timeout

**Solution**:
1. Ensure `frontend/package.json` exists
2. Verify `angular.json` configuration
3. Try forcing a rebuild: Clear cache and redeploy
4. Check Vercel logs for TypeScript errors

### "Room Full" error immediately

**Problem**: Rooms filling up incorrectly

**Solution**:
1. Force refresh client (Ctrl+Shift+R)
2. Wait 30 seconds before joining
3. Try different Room ID
4. Check backend logs for connection issues

### Can't connect to backend from frontend

**Problem**: CORS errors in browser console

**Solution**:
1. Verify `CLIENT_URL` is set in Render
2. Verify `VITE_BACKEND_URL` is set correct in Vercel
3. Restart both services:
   - Render: Manual deploy
   - Vercel: Redeploy from Deployments

### Video doesn't work in mobile

**Problem**: Camera/microphone not working

**Solution**:
1. Check mobile browser permissions
2. Ensure HTTPS (both services provide this)
3. Try Chrome over Safari
4. Check battery saver doesn't restrict camera

---

## Security After Deployment

✅ **Already Configured**:
- WebRTC P2P encryption
- No data stored on servers
- CORS restrictions
- Environment variables protected

⚠️ **Consider Adding**:
- Authentication system
- Room access codes/passwords
- Rate limiting on Render
- Analytics/logging
- Error monitoring (Sentry)

---

## Cost Estimation

| Service | Free Tier | Cost to Upgrade |
|---------|-----------|-----------------|
| Render Backend | $0 (with limits) | $7/month |
| Vercel Frontend | $0 (generous free) | $20/month |
| GitHub | $0 | N/A |
| **Total** | **$0** | **$27/month** |

For production with good uptime, recommend upgrading to Pro plans.

---

## Support

- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **Angular**: https://angular.io/docs
- **Socket.IO**: https://socket.io/docs/
- **WebRTC**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API

---

**Your production video calling app is live! 🎉**
