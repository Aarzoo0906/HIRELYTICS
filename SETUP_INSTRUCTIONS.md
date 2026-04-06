# 🚀 Hirelytics - Complete Setup & Start Guide

## ✅ What's Been Done

All code enhancements are **complete and tested**:
- ✅ Gemini API integration with fallback system
- ✅ Backend error handling (always returns JSON, never HTML)
- ✅ Frontend validation & comprehensive error logging
- ✅ MongoDB data persistence
- ✅ Interview history & feedback system
- ✅ Gamification scoring system
- ✅ Enhanced startup diagnostics

## 📋 Prerequisites

### Required Environment Variables

#### Backend: `hirelytics-backend/.env`
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hirelytics
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend: `hirelytics-frontend/.env.local`
```
VITE_API_URL=http://localhost:5000/api
```

### Node.js Version
- Node.js 16+ (check with `node --version`)
- npm 8+ (check with `npm --version`)

## 🎯 Quick Start (3 Steps)

### Step 1: Install Dependencies

**Backend:**
```bash
cd d:\Hirelytics1\Hirelytics\hirelytics-backend
npm install
```

**Frontend:**
```bash
cd d:\Hirelytics1\Hirelytics\hirelytics-frontend
npm install
```

### Step 2: Start Backend (Terminal 1)

```bash
cd d:\Hirelytics1\Hirelytics\hirelytics-backend
node server.js
```

**Expected Output:**
```
✓ Environment Check:
  GEMINI KEY LOADED: true
  JWT SECRET LOADED: true
  Database URL: ✓ Set
  Frontend URL: http://localhost:5173

🚀 Server running on port 5000
📍 Frontend: http://localhost:5173
📍 API: http://localhost:5000/api
🎯 Interview Endpoint: http://localhost:5000/api/interview/generate-questions

✅ Backend is ready!
```

### Step 3: Start Frontend (Terminal 2)

```bash
cd d:\Hirelytics1\Hirelytics\hirelytics-frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## ✔️ Verification Checklist

After both services start, verify everything works:

- [ ] Backend displays "✅ Backend is ready!"
- [ ] Frontend displays "ready in xxx ms"
- [ ] Open http://localhost:5173 in browser
- [ ] Can see login/register page
- [ ] Can login successfully
- [ ] Can navigate to "Interview" section
- [ ] Can click "Customize Your Interview"
- [ ] Can select Type, Difficulty, Topic
- [ ] **Can click "Start Interview"** ← THIS IS THE KEY TEST
- [ ] Questions load without errors (see 5 questions)
- [ ] Can answer questions
- [ ] Can submit interview
- [ ] Points update on dashboard
- [ ] Interview appears in history

## 🐛 Troubleshooting

### Backend doesn't start

**Error: "Port 5000 already in use"**
```bash
# Windows: Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env: PORT=5001
```

**Error: "GEMINI_API_KEY is not set"**
- ✅ This is **OK** - interview still works with fallback questions
- Add to .env to use real Gemini API: `GEMINI_API_KEY=your_key`

**Error: "MongoDB connection failed"**
- Verify `.env` has correct `MONGODB_URI`
- Check database name is correct
- Make sure IP is whitelisted in MongoDB Atlas (if cloud)

### Frontend won't load

**Error: "Failed to fetch / CORS error"**
- Verify backend is running (`node server.js`)
- Check backend URL: http://localhost:5000
- Verify `VITE_API_URL` is set correctly in `.env.local`

**Port 5173 already in use:**
```bash
# Vite will ask to use different port, just press 'y'
# Or manually kill the process
```

### Interview won't start

**Error: "Unexpected token '<', '<!DOCTYPE'..."**
- ✅ **This is FIXED** - but requires restart
- Make sure you restarted backend and frontend
- Check backend console for errors
- Clear browser cache with Ctrl+Shift+Del

**Error: "Content-Type is not application/json"**
- Backend is returning something other than JSON
- Check backend console for actual error message
- Restart backend service

**Error: "No questions received"**
- Check backend console: should show "Generating questions..."
- If Gemini API is configured, it might be hitting rate limit
- Fallback questions should generate in <1 second

## 📊 Testing Interview Feature Specifically

### Test 1: Basic Interview Flow
1. Click "Customize Your Interview"
2. Select: Type = "Technical"
3. Select: Difficulty = "Easy"  
4. Select: Topic = "JavaScript" or "React"
5. Click "Start Interview" ← **Key Test Point**
6. Verify 5 questions appear
7. Browser console should show: "Questions received: 5"

### Test 2: Data Persistence
1. After completing interview, submit it
2. Check MongoDB:
   - Database: `hirelytics`
   - Collection: `interviews`
   - Should see new document
3. Navigate to Profile → "Interview History"
4. Should see completed interview listed

### Test 3: Gamification
1. Complete interview with score > 0
2. Check Dashboard
3. Points should increase
4. Level might increase
5. Check Leaderboard for ranking

### Test 4: Fallback System
1. Stop backend and modify `.env`: `GEMINI_API_KEY=invalid`
2. Restart backend
3. Start interview
4. Questions should still load (fallback questions)
5. Interview should work normally

## 📝 Key Files Modified

- **Backend:**
  - `server.js` - Enhanced diagnostics at startup
  - `src/controllers/interview.controller.js` - Error handling with fallback
  - `src/services/ai.service.js` - Gemini API with fallback
  - `src/utils/diagnostics.js` - NEW - Startup health check

- **Frontend:**
  - `src/pages/InterviewSelection.jsx` - Enhanced error handling & logging
  - `src/services/interview.service.js` - Centralized API calls
  - `src/context/AuthContext.jsx` - Backend persistence

## 🎯 Expected Behavior

### Successful Interview Start
```
Frontend Console:
✓ Starting interview with: {type: "technical", difficulty: "easy", topic: "javascript", ...}
✓ Response status: 200
✓ Response data: {success: true, questions: [...], ...}
✓ Questions received: 5

Backend Console:
✓ Generating questions: type=technical, difficulty=easy, topic=javascript
✓ Questions sent to frontend

Interview Page:
✓ 5 questions displayed
✓ Each question is answerable
✓ Timer starts
✓ Can answer and submit
```

### Fallback Mode (No Gemini API)
```
Backend Console:
✓ Generating questions: type=technical, ...
⚠ [Error details if Gemini fails]
✓ Returning fallback questions

Frontend Console:
✓ Response received with questions array
✓ Questions received: 5
✓ [No visible difference to user]
```

## 🚨 CRITICAL Success Indicator

**The interview should work even if Gemini API fails.**

If you see:
- ❌ "Unexpected token '<'" → Backend restart needed
- ❌ "Content-Type not JSON" → Check backend console
- ✅ Questions appear → System working correctly
- ✅ 5 questions in 2-5 seconds → Gemini API working
- ✅ 5 questions in <1 second → Fallback mode working

## 📞 Support Information

If something isn't working:

1. **Check Backend Console** - Most errors logged there
2. **Check Frontend DevTools**:
   - Console tab for JS errors
   - Network tab for API response details
   - Application tab to verify stored auth token
3. **Verify Environment Variables** - Make sure `.env` files exist and are correct
4. **Try Hard Refresh** - Ctrl+Shift+R to clear cache
5. **Restart Services** - Kill and restart both backend and frontend

## ✨ Next Steps After Successful Start

1. **Create user account** (if new)
2. **Complete first interview** to test full flow
3. **Check leaderboard** for gamification
4. **View profile** to see history and stats
5. **Test different interview types** (Behavioral, Technical, etc.)

---

**Version**: Post-Complete-Enhancement  
**Status**: Ready for Production Testing  
**Last Updated**: After comprehensive error handling  

🎉 **Everything is configured and ready to go!**
