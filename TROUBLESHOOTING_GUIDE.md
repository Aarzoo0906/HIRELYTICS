# 🔧 TROUBLESHOOTING GUIDE - INTERACTIVE DIAGNOSTIC

## Quick Status Check (Copy & Run)

### Check Backend Status
```powershell
# Terminal 1 - Check if backend is running
netstat -ano | findstr :5000

# If running: You'll see process using port 5000
# If not running: No output (need to start backend)
```

### Start Backend (If Needed)
```powershell
cd d:\Hirelytics1\Hirelytics\hirelytics-backend
node server.js
```
Expected output:
```
Server running on port 5000
MongoDB connected
Gemini API initialized
```

### Start Frontend (If Needed)
```powershell
cd d:\Hirelytics1\Hirelytics\hirelytics-frontend
npm run dev
```
Expected output:
```
VITE v4.x.x ready in XXX ms
➜  Local:   http://localhost:5174/
```

---

## Issue: Login Page Shows But Can't Login/Register

### Diagnostic Checklist

```
[ ] Step 1: Backend running?
    - Terminal shows "Server running on port 5000"
    - No error messages in terminal
    
[ ] Step 2: Frontend running?
    - Browser shows http://localhost:5174
    - Page is not blank white
    
[ ] Step 3: Can see login form?
    - Email input field visible
    - Password input field visible
    - Register link visible
    
[ ] Step 4: Browser console clear (F12)?
    - No red error messages
    - Check Console tab
    
[ ] Step 5: Try to register
    - Enter name: "TestUser123"
    - Enter email: "test@example.com"
    - Enter password: "Test123456"
    - Click Register button
    - What happens?
```

### What Should Happen During Register

**Timeline**:
1. Click Register → Form disappears
2. Shows spinning "Loading..." (3-5 seconds)
3. Either:
   - **SUCCESS**: Redirects to Dashboard ✅
   - **ERROR**: Shows red error box ❌

### Common Register Errors

#### Error: "User already exists"
```
Cause: Email already used
Fix: Use different email address
     Try: test+timestamp@example.com
```

#### Error: "Request failed with status code 400"
```
Cause: Missing required field OR data format wrong
Fix: Check form fields:
     - Name must not be empty
     - Email must be valid format (xxx@xxx.com)
     - Password must be at least 6 characters
```

#### Error: "Request failed with status code 500"
```
Cause: Backend had error processing request
Check:
1. Backend terminal for error messages
2. Is MongoDB connected? (check terminal)
3. Try again - sometimes transient

Fix: 
cd d:\Hirelytics1\Hirelytics\hirelytics-backend
node server.js
```

#### Error: "Network Error" or "Failed to fetch"
```
Cause: Can't reach backend server
Fix:
1. Check if backend running: netstat -ano | findstr :5000
2. Start backend if not running: node server.js
3. Verify it started successfully
4. Refresh browser page (Ctrl+R)
```

### Browser Console Diagnostics (F12)

**Open DevTools**: Press F12

**Go to Console tab**  
Look for any red messages like:
```
❌ Refused to connect to 'http://localhost:5000'
❌ POST http://localhost:5000/api/auth/register 400
❌ Unexpected token '<' in JSON
```

**If red error exists**:
- Take screenshot
- Read error message carefully
- Use error message to find solution below

---

## Issue: Everything Loads But "Loading..." Never Stops

### Cause: Browser State Pollution

**Fix - Clear Browser Data**:
1. Press `Ctrl+Shift+Delete` (Windows)
2. Check: ☑️ Cookies and other site data
3. Check: ☑️ Cached images and files
4. Click "Clear data"
5. Refresh browser

**Alternative - Clear Storage via DevTools**:
1. Press F12
2. Go to "Application" tab
3. Left sidebar → "Local Storage"
4. Click "http://localhost:5174"
5. Right-click → "Clear All"
6. Refresh page

**Still stuck?**:
1. Close browser completely
2. Start fresh: http://localhost:5174
3. Try again

---

## Issue: Shows Error "Cannot Reach Backend"

### Network Diagnostics

**Step 1**: Check if backend running
```powershell
netstat -ano | findstr :5000
```

**If no output** → Backend not running
```powershell
cd d:\Hirelytics1\Hirelytics\hirelytics-backend
node server.js
```

**If yes, continue to Step 2** → Check if port correct

**Step 2**: Verify frontend config
```powershell
# Check frontend environment
type "d:\Hirelytics1\Hirelytics\hirelytics-frontend\.env.local"
```

**Should show**:
```
VITE_API_URL=http://localhost:5000/api
```

**If missing or wrong**:
1. Create/edit file: `hirelytics-frontend\.env.local`
2. Add line: `VITE_API_URL=http://localhost:5000/api`
3. Save file
4. Restart frontend: Stop (Ctrl+C) and `npm run dev`
5. Refresh browser

**Step 3**: Check browser Network tab
1. Press F12
2. Go to "Network" tab
3. Try to register
4. Look for request to: `/auth/register`
5. Check response status:
   - 🟢 Green 201/200 = Success (but UI not updating)
   - 🔴 Red 400/500 = Backend error
   - ⏱️ Crossed out = Network timeout

---

## Issue: Login Says "User Not Found"

**This is EXPECTED if**:
- You trying to login before registering
- You using wrong email address
- You using email from different browser/device

**Fix**:
1. Click "Register" link
2. Create account with that email
3. Then try login

---

## Issue: Login Works But Dashboard Blank

### Cause: Page Not Rendering Properly

**Fix Option 1**: Hard Refresh
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

**Fix Option 2**: Clear Cache
1. Press F12
2. Right-click refresh button
3. Click "Empty cache and hard refresh"

**Fix Option 3**: Check Console Errors
1. Press F12
2. Go to Console tab
3. Look for red errors
4. Share error message here

---

## Issue: Interview Won't Start / "Generating..." Stuck

### Diagnostic Steps

**Step 1**: Check Backend Terminal
- Look for error messages
- Is MongoDB still connected?
- Is Gemini API working?

**Step 2**: Run Interview Test
```powershell
cd d:\Hirelytics1\Hirelytics\hirelytics-backend
node "d:\Hirelytics1\test-complete-system.js"
```

**Should see**:
```
✅ TEST 1: User Registration PASSED
✅ TEST 2: User Login PASSED
✅ TEST 3: Generate Questions PASSED
✅ TEST 4: Save Answers PASSED
✅ All tests passed!
```

**If test fails**:
- Read error message
- Check backend terminal
- Restart backend

**Step 3**: Try In Browser
1. Clear browser cache (Ctrl+Shift+Delete)
2. Go to Interview page again
3. Select options again
4. Click "Start Interview"
5. Wait full 10 seconds
6. Does it work?

---

## Issue: Getting Weird Characters or HTML Errors

### Cause: Backend Returning HTML Instead of JSON

**Error looks like**:
```
<!DOCTYPE html>
<html>
<head><title>500 Error</title></head>
...
```

**Or Error**:
```
Unexpected token '<' in JSON at position 0
```

**Fix**:
1. Stop backend: Press Ctrl+C in backend terminal
2. Start backend fresh:
```powershell
cd d:\Hirelytics1\Hirelytics\hirelytics-backend
node server.js
```
3. Refresh browser page
4. Try again

**If still happening**:
1. Check backend terminal for errors
2. Read error message carefully
3. Example: If says "Cannot find module" run: `npm install`

---

## Full System Test (Validates Everything)

### Part 1: Backend Test

**Run this**:
```powershell
cd d:\Hirelytics1
node test-all-apis.js
```

**Should output**:
```
✅ POST /auth/register → 201 OK
✅ POST /auth/login → 200 OK
✅ POST /interview/generate-questions → 200 OK
```

**If any shows ❌ or 500**:
- Run: `node "d:\Hirelytics1\Hirelytics\hirelytics-backend\server.js"` in same terminal
- Then run test again

### Part 2: Frontend Test

1. Open http://localhost:5174
2. Should see login page
3. Click Register
4. Fill form
5. Click Register button
6. Should redirect to dashboard
7. ✅ Success!

---

## Advanced Diagnostics (For Complex Issues)

### Check MongoDB Connection

**Windows Command**:
```powershell
# Option 1: Check if MongoDB service running
Get-Service MongoDB

# Option 2: Try to connect
# Open PowerShell and run:
# cd "C:\Program Files\MongoDB\Server\5.0\bin"
# mongod
```

### Check Port Usage

**Find what's using port 5000**:
```powershell
netstat -ano | findstr :5000
# Look at last column - that's the Process ID (PID)

# Kill process (replace XXXX with PID):
taskkill /PID XXXX /F
```

### Check Environment Variables

**Frontend**:
```powershell
type "d:\Hirelytics1\Hirelytics\hirelytics-frontend\.env.local"
```
Should have: `VITE_API_URL=http://localhost:5000/api`

**Backend**:
```powershell
type "d:\Hirelytics1\Hirelytics\hirelytics-backend\.env"
```
Should have:
```
MONGODB_URI=mongodb://localhost:27017/hirelytics
GEMINI_API_KEY=your_key_here (optional)
JWT_SECRET=your_secret_here
PORT=5000
```

---

## Information to Provide When Asking for Help

**When reporting an issue**, provide**:

1. **Exact Error Message**
   - Screenshot or copy-paste text
   - Or read from browser console (F12)

2. **Where Error Appears**
   - Login page? Register page? Dashboard?
   - After clicking what button?

3. **Backend Terminal Output**
   - Copy last 20 lines from backend terminal
   - Any error messages?

4. **Frontend Terminal Output**
   - Copy last 20 lines from frontend terminal
   - Any error messages?

5. **Browser Console Output**
   - Press F12 → Console tab
   - Any red messages?

6. **What You Tried**
   - What fixes have you attempted?
   - Did any help?

---

## Quick Fix Summary

| Problem | Quick Fix |
|---------|-----------|
| Backend won't start | `node server.js` in hirelytics-backend folder |
| Frontend blank page | Hard refresh: `Ctrl+Shift+R` |
| Can't connect to backend | Check backend running: `netstat -ano \| findstr :5000` |
| Login doesn't work | Clear localStorage (F12 → Application → Clear All) |
| Interview stuck | Run system test: `node test-complete-system.js` |
| Port already in use | `taskkill /PID XXXX /F` (get PID from netstat output) |
| Module errors | `npm install` in problematic folder |
| All else fails | Stop everything, restart both terminals |

---

## Contact Info for Detailed Help

When everything is resolved, you should have:
1. ✅ Backend running on http://localhost:5000
2. ✅ Frontend running on http://localhost:5174
3. ✅ Can register new users
4. ✅ Can login with registered users
5. ✅ Can start interviews
6. ✅ Can see interview questions
7. ✅ Can submit answers and see results

**Current Status**: All backend APIs confirmed working. Frontend should work smoothly. Use this guide to diagnose any specific UI/display issues.
