# 🏗️ Hirelytics Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                     │
│                   Port: 5173 (localhost)                        │
├─────────────────────────────────────────────────────────────────┤
│  Pages: Login, Dashboard, Interview, Profile, Results, etc.    │
│  State: AuthContext (user + interview data)                    │
│  Storage: localStorage (JWT token + interview backup)          │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP/JSON
                       │ CORS Enabled
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js + Express)                    │
│                  Port: 5000 (localhost)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Routes Layer                                             │  │
│  │ - /auth/* → auth.controller                             │  │
│  │ - /interview/* → interview.controller                   │  │
│  │ - /user/* → user.controller                             │  │
│  │ - /gamification/* → gamificationController              │  │
│  │ - /admin/* → admin.controller                           │  │
│  └──────────────┬───────────────────────────────────────────┘  │
│                 │                                                │
│  ┌──────────────▼───────────────────────────────────────────┐  │
│  │ Controllers Layer                                        │  │
│  │ - Validates requests                                    │  │
│  │ - Calls services & models                              │  │
│  │ - Returns JSON responses                               │  │
│  └──────────────┬───────────────────────────────────────────┘  │
│                 │                                                │
│  ┌──────────────▼─────────────────┬──────────────────────────┐ │
│  │ Services & Models              │                          │ │
│  │ - ai.service.js                │  Middleware Layer:      │ │
│  │ - scoring.service.js           │  - Auth middleware      │ │
│  │ - User, Interview, Badge       │  - Error handler        │ │
│  │   models                        │  - Rate limiter         │ │
│  └──────────────┬──────────────────┴──────────────────────────┘ │
│                 │                                                │
└─────────────────┼────────────────────────────────────────────────┘
                  │
        ┌─────────┴──────────┬──────────────────┐
        │                    │                  │
        ▼                    ▼                  ▼
    ┌─────────┐        ┌──────────┐      ┌──────────────┐
    │ MongoDB │        │ Gemini   │      │ Google Auth │
    │ Database│        │ API      │      │   (future)   │
    │         │        │          │      │              │
    │ - Users │        │ Models:  │      │              │
    │ - Interviews     │ Flash    │      │              │
    │ - Badges        │ Lite     │      │              │
    │ - Gamification  │          │      │              │
    └─────────┘        └──────────┘      └──────────────┘
```

## Interview Feature: Complete Data Flow

### Step 1️⃣: User Selects Interview Type/Difficulty/Topic

```
InterviewSelection.jsx
  ↓
User clicks "Start Interview"
  ↓
handleStartInterview() function triggered
  ↓
Validates: Type, Difficulty, Topic selected
```

### Step 2️⃣: Frontend Sends Request to Backend

```
Frontend (InterviewSelection.jsx)
  │
  ├─ URL: http://localhost:5000/api/interview/generate-questions
  ├─ Method: POST
  ├─ Headers: {
  │    "Content-Type": "application/json"
  │  }
  ├─ Body: {
  │    type: "technical",
  │    difficulty: "easy",
  │    topic: "javascript"
  │  }
  │
  └─▶ Backend: interview.routes.js
     ↓
     Receives POST request
     ↓
     Calls: interview.controller.js → generateAIQuestions()
```

### Step 3️⃣: Backend Generates Questions

```
interview.controller.js → generateAIQuestions()
  │
  ├─ Validates: type, difficulty, topic required
  │  └─ If missing → Return 400 error
  │
  ├─ Calls: ai.service.js → generateQuestions(type, difficulty, topic)
  │  │
  │  ├─ Option A: Uses Gemini API (if GEMINI_API_KEY set)
  │  │  │
  │  │  ├─ Creates prompt: "Generate 5 [difficulty] [type] questions about [topic]"
  │  │  │
  │  │  ├─ Calls: callGeminiAPI(prompt)
  │  │  │  │
  │  │  │  ├─ URL: https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent
  │  │  │  │
  │  │  │  ├─ Returns: AI-generated questions
  │  │  │  │
  │  │  │  └─ Parses response: JSON → questions array
  │  │  │
  │  │  └─ Returns: [question1, question2, ...]
  │  │
  │  ├─ Option B: Falls back to local questions (if Gemini fails/not configured)
  │  │  │
  │  │  └─ buildLocalFallbackQuestions(type, difficulty, topic)
  │  │     Returns: [contextual questions...]
  │  │
  │  └─ Catch error → Always return fallback (never throw)
  │
  ├─ Validates: Questions array has content
  │  └─ If empty → Use fallback
  │
  └─▶ Returns: HTTP 200 with JSON
     {
       success: true,
       message: "Questions generated successfully",
       type: "technical",
       difficulty: "easy",
       topic: "javascript",
       questions: [
         "Question 1: ...",
         "Question 2: ...",
         ...
       ]
     }
```

### Step 4️⃣: Frontend Receives & Validates Response

```
Frontend: handleStartInterview()
  │
  ├─ Checks: Response.ok === true (status 200)
  │
  ├─ Validates: Content-Type header
  │  └─ Must include "application/json"
  │  └─ If not → Error: "Expected JSON but got ..."
  │
  ├─ Parses: response.json()
  │  └─ If fails → Error: "Invalid JSON"
  │
  ├─ Validates: data.questions is array
  │  └─ Must have length > 0
  │  └─ If not → Error: "No questions received"
  │
  ├─ Logs: "Questions received: 5"
  │
  └─▶ Navigate to Interview page with questions
```

### Step 5️⃣: User Answers Questions

```
Interview.jsx
  │
  ├─ Displays: 5 questions one by one
  ├─ Timer: Counts down total interview time
  ├─ User answers: Each answer saved to state
  │
  └─▶ User clicks "Submit Interview"
```

### Step 6️⃣: Frontend Submits Interview

```
Interview.jsx → handleSubmit()
  │
  ├─ Prepares data: {
  │    type, difficulty, topic, answers, totalTime, timePerQuestion
  │  }
  │
  ├─ Calls: POST /api/interview/submit
  │
  └─▶ Backend: interview.controller.js → submitInterview()
```

### Step 7️⃣: Backend Saves Interview & Updates Gamification

```
Backend: submitInterview() controller
  │
  ├─ Validates: type, category, answers required
  │
  ├─ Creates Interview document:
  │  {
  │    user: userId,
  │    category: category,
  │    questions: [ {answer1}, {answer2}, ... ],
  │    totalScore: score,
  │    type, difficulty, totalTime, timePerQuestion
  │  }
  │
  ├─ Saves to MongoDB: interviews collection
  │
  ├─ Updates User gamification:
  │  {
  │    interviewsTaken: +1,
  │    points: +score,
  │    level: Math.floor(points/100) + 1
  │  }
  │
  ├─ Saves to MongoDB: users collection
  │
  └─▶ Returns: HTTP 201 Created with success message
     {
       success: true,
       message: "Interview submitted successfully",
       interviewId: "...",
       totalScore: 85,
       interview: {...}
     }
```

### Step 8️⃣: Frontend Displays Results & Updates Dashboard

```
Frontend: Result.jsx
  │
  ├─ Receives: Interview data, score, feedback
  ├─ Displays: Score, suggestions, comparison to previous
  ├─ Updates: AuthContext (user points, interview count)
  ├─ Updates: localStorage (backup)
  │
  └─▶ User navigates: Dashboard shows updated points & rank
```

## Error Handling Flow

```
Any error in generateAIQuestions()
  │
  ├─ Backend catches error in try-catch
  │
  ├─ Logs: Error details to console
  │
  ├─ Calls: buildLocalFallbackQuestions()
  │
  ├─ Returns: HTTP 200 (not 500!)
  │  {
  │    success: true,
  │    message: "Questions generated (fallback mode)",
  │    questions: [fallback questions]
  │  }
  │
  ├─ Frontend receives: Valid JSON with questions
  │
  ├─ Frontend's error handling: Validates JSON first
  │
  ├─ Never shows: "<" or "<!DOCTYPE" errors
  │
  └─▶ User sees: Normal interview flow continues!
```

## Environment Dependencies

```
.env (Backend)
  │
  ├─ MONGODB_URI
  │  └─ Points to: MongoDB Atlas or local MongoDB
  │
  ├─ JWT_SECRET
  │  └─ Used by: auth.middleware.js
  │
  ├─ GEMINI_API_KEY
  │  └─ Used by: ai.service.js → callGeminiAPI()
  │
  ├─ PORT (default: 5000)
  │  └─ Backend server listens on this port
  │
  ├─ FRONTEND_URL (default: http://localhost:5173)
  │  └─ Used by: CORS configuration
  │
  └─ NODE_ENV (development/production)
     └─ Used by: Logging, error handling

.env.local (Frontend)
  │
  └─ VITE_API_URL (default: http://localhost:5000/api)
     └─ Used by: interview.service.js, all API calls
```

## Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  username: String,
  email: String (unique),
  password: String (hashed),
  
  // Gamification
  points: Number (default: 0),
  level: Number (default: 1),
  interviewsTaken: Number (default: 0),
  
  // Badges & Achievements
  badges: [BadgeId],
  achievements: [AchievementId],
  
  createdAt: Date,
  updatedAt: Date
}
```

### Interview Schema
```javascript
{
  _id: ObjectId,
  user: UserId (reference),
  category: String,
  type: String ("technical" | "behavioral"),
  difficulty: String ("easy" | "medium" | "hard"),
  topic: String,
  
  // Questions & Answers
  questions: [
    {
      questionIndex: Number,
      answer: String,
      score: Number
    }
  ],
  
  // Scoring
  totalScore: Number,
  totalTime: Number (seconds),
  timePerQuestion: Number (seconds),
  status: String ("completed" | "pending"),
  
  createdAt: Date,
  updatedAt: Date
}
```

## File Structure with Data Flow

```
hirelytics-backend/
├── server.js ─────────────────► Starts Express app, checks environment
├── src/
│   ├── app.js ─────────────────► CORS, middleware, routes registration
│   ├── config/
│   │   ├── db.js ──────────────► Connects to MongoDB
│   │   └── jwt.js ─────────────► JWT utilities
│   ├── controllers/
│   │   ├── interview.controller.js ── Handles interview endpoints
│   │   ├── auth.controller.js ──────── Handles auth endpoints
│   │   ├── user.controller.js ──────── User profile endpoints
│   │   └── ...
│   ├── services/
│   │   ├── ai.service.js ──────► Gemini API calls & fallback logic
│   │   ├── scoring.service.js ─► Question evaluation
│   │   └── gamification.service.js
│   ├── models/
│   │   ├── User.js ────────────► User schema & methods
│   │   ├── Interview.js ───────► Interview schema
│   │   ├── Badge.js ───────────► Badge schema
│   │   └── ...
│   ├── routes/
│   │   ├── interview.routes.js ─► POST /generate-questions, /submit
│   │   ├── auth.routes.js ──────► POST /login, /register
│   │   └── ...
│   ├── middlewares/
│   │   ├── auth.middleware.js ──► Validates JWT token
│   │   ├── error.middleware.js ─► Catches & handles errors
│   │   └── rateLimit.middleware.js
│   └── utils/
│       └── diagnostics.js ──────► Startup health checks

hirelytics-frontend/
├── vite.config.js ────────────► Vite configuration
├── src/
│   ├── main.jsx ───────────────► React app entry
│   ├── App.jsx ────────────────► Main app with routes
│   ├── context/
│   │   └── AuthContext.jsx ────► User & interview state
│   ├── pages/
│   │   ├── InterviewSelection.jsx ── Question generation page
│   │   ├── Interview.jsx ──────────── Answer submission page
│   │   ├── Result.jsx ────────────── Results display
│   │   └── ...
│   ├── components/
│   │   ├── QuestionCard.jsx ─── Individual question component
│   │   ├── Sidebar.jsx ──────── Navigation sidebar
│   │   └── ...
│   └── services/
│       └── interview.service.js ─► API calls for interview endpoints
```

## Response Examples

### ✅ Successful Interview Start

```json
{
  "success": true,
  "message": "AI questions generated successfully",
  "type": "technical",
  "difficulty": "easy",
  "topic": "javascript",
  "questions": [
    "Explain the difference between var, let, and const in JavaScript",
    "What is the event loop and how does it work?",
    "Describe the concept of closures and provide a real-world example",
    "What are Promises and how do they differ from callbacks?",
    "Explain async/await and how it simplifies asynchronous code"
  ]
}
```

### ✅ Fallback Questions (Safety Net)

```json
{
  "success": true,
  "message": "Questions generated (fallback mode)",
  "type": "technical",
  "difficulty": "easy",
  "topic": "javascript",
  "questions": [
    "Explain javascript fundamentals at a beginner level and when to use them in real projects.",
    "Describe a practical javascript problem you solved and the trade-offs you considered.",
    "How would you evaluate different approaches to javascript in a technical interview setting?",
    "Share a scenario where javascript failed or caused issues, and how you diagnosed and fixed it.",
    "If you had to mentor a junior on javascript, what step-by-step plan would you give?"
  ]
}
```

### ❌ Error Handling (Frontend Logging)

```javascript
// Browser Console Output
"Starting interview with: {
  type: "technical",
  difficulty: "easy",
  topic: "javascript",
  apiUrl: "http://localhost:5000/api/interview/generate-questions"
}"

"Response status: 200"

"Response headers: {
  content-type: 'application/json; charset=utf-8',
  ...
}"

"Response data: {success: true, questions: [...]}"

"Questions received: 5"
```

---

**This architecture ensures:**
- ✅ Never crashes due to HTML errors
- ✅ Graceful fallback when Gemini API unavailable
- ✅ Clear error messages for debugging
- ✅ Data persisted to MongoDB for history
- ✅ Gamification updates in real-time
- ✅ Complete audit trail of all interviews
