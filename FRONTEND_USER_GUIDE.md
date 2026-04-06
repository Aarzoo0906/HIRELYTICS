# 🎨 FRONTEND GUIDE - WHAT TO EXPECT

## Current Services Status

```
✅ Backend: http://localhost:5000  (Running)
✅ Frontend: http://localhost:5174 (Running)
✅ Database: MongoDB connected
✅ API: All endpoints responding
```

---

## Application Flow

### Login / Register Page

**URL**: http://localhost:5174

**You should see**:
1. Hirelytics logo and title
2. Two sections: "Sign In" and "Create Account" (via Register link)
3. Input fields for email/password
4. Nice styling with gradients

**What happens**:
- If not logged in → Shows Login page
- If logged in → Redirects to Dashboard

### Registration Page**

**URL**: http://localhost:5174/register

**Form Fields**:
- Full Name
- Email  
- Password (min 6 chars)

**After Submit**:
- ✅ If success → Logs you in automatically
- ✅ Redirects → Dashboard
- ❌ If error → Shows red error box with message

### Dashboard Page

**URL**: http://localhost:5174/dashboard

**You should see**:
1. Welcome message ("Welcome back, [Your Name]")
2. Statistics cards:
   - Total Points
   - Interviews Taken
   - Current Level
   - Join Date
3. Sidebar with navigation:
   - Interview
   - Profile
   - Settings
   - Leaderboard
   - Achievements

**Features**:
- Dark mode toggle (top right)
- Logout button

### Interview Selection Page

**URL**: http://localhost:5174/interview-selection (or click Interview in sidebar)

**You should see**:
1. "Customize Your Interview" heading with gradient background
2. Three selection areas:
   - Interview Type (Technical / Behavioral)
   - Difficulty Level (Easy / Medium / Hard)
   - Topic/Subject (JavaScript, React, Python, etc.)
3. "Start Interview" button (enabled when all selections made)

**What happens**:
- Click "Start Interview"
- Page shows "Generating..." or spinner
- **2-5 seconds later**: 5 questions load
- Redirects to Interview page

### Interview Page

**URL**: http://localhost:5174/interview

**You should see**:
1. Question display area
2. Text input for your answer
3. Navigation buttons: Previous / Next
4. Timer showing remaining time
5. Submit button at the end

**What happens**:
- Answer all 5 questions
- Click "Submit Interview"
- Page shows "Submitting..."
- Redirects to Result page

### Result Page

**URL**: http://localhost:5174/result

**You should see**:
1. Your score (X/100)
2. Performance analysis
3. Feedback/suggestions
4. Button to go back to dashboard

**What gets updated**:
- Dashboard: Points updated
- Dashboard: Interviews count increased
- Profile: Interview added to history

### Profile Page

**URL**: http://localhost:5174/profile

**You should see**:
1. Your profile information
2. Tabs:
   - Interview History
   - Statistics
   - Achievements
3. Past interviews listed with:
   - Date/Time
   - Type (Technical/Behavioral)
   - Difficulty
   - Score

### Leaderboard Page

**URL**: http://localhost:5174/leaderboard (or Gamification > Leaderboard)

**You should see**:
1. Top ranked users
2. Their points and levels
3. Your position in ranking

### Achievements Page

**URL**: http://localhost:5174/achievements

**You should see**:
1. Available badges/achievements
2. Requirements for each
3. Progress towards unlocking

---

## Browser Console (F12) - What to Check

**Open DevTools**: Press F12 in browser

**Console Tab** - Look for:
- ✅ No red error messages
- ✅ Network requests showing 200 status codes
- ✅ Successful auth messages

**Network Tab** - Look for:
- ✅ POST /auth/login - Status 200
- ✅ POST /auth/register - Status 201  
- ✅ POST /interview/generate-questions - Status 200
- ❌ Red status codes (400, 500) indicate errors

**Application Tab** - Look for:
- ✅ localStorage > token (should contain JWT string)
- ✅ localStorage > user (should contain user data JSON)

---

## Common Frontend Issues & Solutions

### Issue 1: Login page shows, but nothing works
**Cause**: Backend not running  
**Check**: 
- Terminal 1 should show "Server running on port 5000"
- Start backend: `node server.js`

### Issue 2: Getting "Cannot reach server" or network errors
**Cause**: API URL misconfigured
**Check**:
- File: `hirelytics-frontend/.env.local`
- Should contain: `VITE_API_URL=http://localhost:5000/api`
- Restart frontend: `npm run dev`

### Issue 3: Shows "Loading..." forever
**Cause**: Frontend stuck checking auth
**Fix**:
- Press F12
- Go to Application tab
- Clear localStorage
- Refresh page

### Issue 4: Can register but can't login after
**Cause**: User creation failed silently
**Fix**:
- Check browser console for errors
- Check backend terminal for errors
- Try registering with different email

### Issue 5: Interview won't start, shows "Generating..."
**Cause**: Questions API timing out
**Check**:
- Backend running? (check terminal 1)
- Try API test: `node "d:\Hirelytics1\test-complete-system.js"`

### Issue 6: Page shows "Not Found" or blank white screen
**Cause**: React Router issue
**Fix**:
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R
- Restart frontend: npm run dev

---

## Testing the Frontend System

### Quick Test (5 minutes)

1. Open browser: http://localhost:5174
2. You should see login page
3. Click "Register"
4. Fill form with:
   - Name: "Test123"
   - Email: "test123@test.com"
   - Password: "Test123456"
5. Click Register button
6. Should go to Dashboard
7. ✅ If yes, frontend is working!

### Full Test (15 minutes)

After Step 7 above:
1. Click "Interview" in sidebar
2. Select: Technical / Easy / JavaScript
3. Click "Start Interview"
4. Wait 3-5 seconds
5. Questions should appear
6. Answer one question
7. Click Next
8. Answer remaining questions
9. Click Submit
10. See results page
11. ✅ If everything works, system is perfect!

---

## Frontend Error Messages - What They Mean

| Error | Cause | Fix |
|-------|-------|-----|
| "User not found" | Email not registered | Click Register first |
| "User already exists" | Email already registered | Use different email |
| "Invalid credentials" | Wrong password | Check password |
| "Network Error" | Backend not running | Start backend |
| "Cannot reach server" | Wrong API URL | Check .env.local |
| "Unexpected token <" | Backend returning HTML | Restart backend |
| "Loading..." (stuck) | Auth check hanging | Clear localStorage |

---

## Frontend Features Working Status

| Feature | Status | Notes |
|---------|--------|-------|
| Registration | ✅ Works | Name/Email/Password |
| Login | ✅ Works | JWT token generated |
| Dashboard | ✅ Works | Shows stats |
| Interview Start | ✅ Works | Questions load |
| Question Display | ✅ Works | 5 questions shown |
| Answer Submission | ✅ Works | Data saved |
| Results Page | ✅ Works | Score displayed |
| Profile | ✅ Works | History shown |
| Leaderboard | ✅ Works | Rankings displayed |
| Dark Mode | ✅ Works | Theme toggle |
| Responsive | ✅ Works | Mobile/Tablet/Desktop |

---

## Browser Requirements

- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ❌ Internet Explorer (Not supported)

**Features Used**:
- localStorage (for token & user data)
- Fetch API (for API calls)
- CSS Grid/Flexbox
- ES6+ JavaScript

---

## Keyboard Shortcuts

- `F12` - Open DevTools
- `Ctrl+Shift+R` - Hard refresh (clear cache)
- `Ctrl+Shift+Delete` - Clear browser data

---

## Still Having Issues?

### Step 1: Check Browser Console (F12)
- Screenshot the error  
- Copy the exact error message

### Step 2: Check Backend Terminal
- Is there an error message?
- Is backend still running?

### Step 3: Check Network Tab (F12)
- Find the failed API call
- Check response status code
- Read the response body

### Step 4: Verify Setup
```bash
# Terminal 1: Backend
cd d:\Hirelytics1\Hirelytics\hirelytics-backend
node server.js
# Should show: "Server running on port 5000"

# Terminal 2: Frontend
cd d:\Hirelytics1\Hirelytics\hirelytics-frontend
npm run dev
# Should show: "ready in XXX ms"
```

---

## Next Steps

✅ Verify frontend is running on http://localhost:5174  
✅ Verify backend is running (shown in terminal)  
✅ Test registration (new user)  
✅ Test login  
✅ Test interview feature  

**Everything should work smoothly!** 🚀

If not, provide:
1. Exact error message from console
2. Screenshot of error
3. Backend terminal output
4. Frontend terminal output
