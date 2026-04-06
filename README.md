# Hirelytics - AI-Powered Interview Platform

## 🎯 What is Hirelytics?

Hirelytics is a **full-stack AI-powered interview platform** that uses Google's Gemini API to generate dynamic interview questions and evaluate candidate responses. It features:

- 🤖 **AI Question Generation** - Dynamic questions generated using Gemini API
- 🎮 **Gamification System** - Points, levels, badges, and leaderboards
- 📊 **Performance Analytics** - Detailed feedback and improvement suggestions
- 💾 **Data Persistence** - All interviews saved to MongoDB
- 🔐 **Secure Authentication** - JWT-based user authentication
- 🎨 **Modern UI** - React with TailwindCSS styling
- ⚡ **Fast & Reliable** - Built with Node.js and Express

## 📖 Documentation Guide

### 🚀 Getting Started (START HERE!)
**File: [`QUICK_START.md`](./QUICK_START.md)**
- Copy-paste commands to run everything
- Expected output at each step
- Takes 5 minutes

### 📋 Detailed Setup
**File: [`SETUP_INSTRUCTIONS.md`](./SETUP_INSTRUCTIONS.md)**
- Complete installation guide
- Environment variable configuration
- Troubleshooting common issues
- Performance benchmarks

### 🏗️ System Architecture
**File: [`ARCHITECTURE.md`](./ARCHITECTURE.md)**
- System architecture diagrams
- Complete API data flow
- Database schemas
- Error handling mechanisms
- File structure explanation

### 🧪 Testing & Verification
**File: [`TESTING_GUIDE.md`](./TESTING_GUIDE.md)**
- Phase-by-phase verification procedures
- Expected outputs at each step
- Quick troubleshooting matrix
- Performance expectations

---

## ⚡ Quick Start (90 Seconds)

```bash
# Terminal 1: Start Backend
cd d:\Hirelytics1\Hirelytics\hirelytics-backend
node server.js

# Terminal 2: Start Frontend
cd d:\Hirelytics1\Hirelytics\hirelytics-frontend
npm run dev

# Browser: Open
http://localhost:5173
```

**That's it!** Your application is running.

---

## 🎯 Critical Success Test

**If this works, everything works:**

```
1. Login
2. Click "Interview"
3. Select: Technical / Easy / JavaScript
4. Click "Start Interview"
5. ✅ 5 questions appear (no <!DOCTYPE errors)
```

---

## 📁 Project Structure

```
Hirelytics/
├── 📚 Documentation
│   ├── QUICK_START.md                ← Start here
│   ├── SETUP_INSTRUCTIONS.md
│   ├── ARCHITECTURE.md
│   ├── TESTING_GUIDE.md
│   └── README.md (this file)
│
├── hirelytics-backend/               ← Node.js + Express
│   ├── .env                          ← Environment variables
│   ├── server.js                     ← Entry point
│   ├── src/
│   │   ├── app.js                    ← Express app setup
│   │   ├── controllers/              ← Business logic
│   │   │   ├── interview.controller.js ← Interview endpoints
│   │   │   ├── auth.controller.js
│   │   │   └── ...
│   │   ├── services/                 ← External integrations
│   │   │   ├── ai.service.js         ← Gemini API
│   │   │   ├── scoring.service.js
│   │   │   └── gamification.service.js
│   │   ├── models/                   ← Database schemas
│   │   │   ├── Interview.js
│   │   │   ├── User.js
│   │   │   └── Badge.js
│   │   ├── routes/                   ← API routes
│   │   ├── middlewares/              ← Auth, error handling
│   │   ├── config/                   ← Database, JWT setup
│   │   └── utils/                    ← Helpers
│   └── package.json
│
└── hirelytics-frontend/              ← React + Vite
    ├── .env.local                    ← Frontend API URL
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx                  ← React entry
    │   ├── App.jsx                   ← Main app
    │   ├── pages/                    ← Page components
    │   │   ├── InterviewSelection.jsx ← Question generation
    │   │   ├── Interview.jsx         ← Answer submission
    │   │   ├── Dashboard.jsx
    │   │   └── ...
    │   ├── components/               ← Reusable components
    │   ├── context/                  ← State management
    │   │   └── AuthContext.jsx
    │   └── services/                 ← API calls
    │       └── interview.service.js
    └── package.json
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI**: Google Gemini API (gemini-2.5-flash-lite)
- **Other**: CORS, Rate Limiting, bcrypt

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State**: React Context API
- **HTTP**: Fetch API

### Deployment-Ready
- Docker support ready
- Environment-based configuration
- Production error handling
- Comprehensive logging

---

## 🚀 Key Features

### 1. AI Interview Generation
- **Gemini API Integration**: Uses Google's latest Gemini model
- **5 Dynamic Questions**: 
  - Technical interviews (JavaScript, React, Python, etc.)
  - Behavioral interviews (Leadership, Problem-solving, etc.)
  - Difficulty levels: Easy, Medium, Hard
- **Fallback System**: Works even if API fails

### 2. Interview System
- Clean, distraction-free interface
- Per-question timer
- Total interview timer
- Real-time answer tracking
- Instant submission

### 3. Evaluation & Analytics
- AI-powered answer evaluation
- Performance scoring
- Comparative analysis
- Improvement suggestions
- Detailed feedback

### 4. Gamification
- **Points System**: Earn points per interview
- **Levels**: Progress through levels
- **Badges**: Unlock achievements
- **Leaderboard**: Compete with others
- **Statistics**: Track progress over time

### 5. Data Persistence
- All interviews saved to MongoDB
- Interview history tracking
- Performance trends
- User profiles
- Achievement records

### 6. Security
- JWT authentication
- Password hashing with bcrypt
- Protected routes
- Rate limiting
- CORS configuration

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Interview
- `POST /api/interview/generate-questions` - Generate AI questions
- `POST /api/interview/submit` - Submit completed interview
- `GET /api/interview/history` - Get user's interview history
- `GET /api/interview/feedback` - Get performance feedback

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/stats` - Get user statistics

### Gamification
- `GET /api/gamification/leaderboard` - Get rankings
- `GET /api/gamification/achievements` - Get user achievements
- `GET /api/gamification/badges` - Get available badges

---

## ⚙️ Environment Configuration

### Backend (.env required)

```
# MongoDB Connection
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hirelytics

# JWT Configuration  
JWT_SECRET=your_super_secret_key_here_min_32_chars

# Gemini API (get from Google Cloud Console)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local required)

```
# API Base URL
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing the System

### Quick Verification (5 minutes)

1. **Start Backend**: `node server.js` in `hirelytics-backend/`
2. **Start Frontend**: `npm run dev` in `hirelytics-frontend/`
3. **Open Browser**: http://localhost:5173
4. **Test Interview**: Select options and click "Start Interview"
5. **Verify**: 5 questions should load without errors

### Full Test Suite (20 minutes)

Follow the step-by-step procedures in [`TESTING_GUIDE.md`](./TESTING_GUIDE.md):
- Backend startup verification
- Frontend startup verification
- Authentication testing
- Interview generation testing
- Interview submission testing
- Data persistence verification
- Gamification verification

---

## 🐛 Troubleshooting

### "Unexpected token '<'" error
- Backend returning HTML instead of JSON
- **Fix**: Restart backend with `node server.js`
- See [`SETUP_INSTRUCTIONS.md`](./SETUP_INSTRUCTIONS.md) for details

### Port already in use
- Another process using port 5000 or 5173
- **Fix**: Kill existing process or use different port
- See [`SETUP_INSTRUCTIONS.md`](./SETUP_INSTRUCTIONS.md) for detailed commands

### MongoDB connection failed
- Invalid connection string
- **Fix**: Verify `MONGODB_URI` in `.env`
- Check IP whitelist in MongoDB Atlas

### CORS error
- Frontend URL mismatch
- **Fix**: Ensure `FRONTEND_URL` matches actual frontend URL in `.env`

**For comprehensive troubleshooting, see [`TESTING_GUIDE.md`](./TESTING_GUIDE.md)**

---

## 📈 Performance

| Operation | Expected Time |
|-----------|---------------|
| Backend Startup | < 3 seconds |
| Frontend Startup | < 5 seconds |
| AI Question Generation | 2-5 seconds (Gemini) |
| AI Question Generation | < 1 second (Fallback) |
| Interview Submission | 1-2 seconds |
| Leaderboard Load | < 2 seconds |
| Dashboard Update | < 1 second |

---

## 🔒 Security Features

- ✅ JWT authentication with expiration
- ✅ Password hashing with bcrypt
- ✅ Protected routes with auth middleware
- ✅ CORS configuration
- ✅ Rate limiting on API endpoints
- ✅ Environment variable protection
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection

---

## 🎨 UI/UX Features

- 🌙 Dark mode support
- 📱 Responsive design (mobile, tablet, desktop)
- ⚡ Smooth animations and transitions
- 🎯 Intuitive navigation
- ♿ Accessible components
- 🎪 Professional styling with gradients

---

## 📚 Learning Resources

### For Backend Development
- Express.js: https://expressjs.com
- MongoDB: https://www.mongodb.com
- Mongoose: https://mongoosejs.com
- JWT: https://jwt.io

### For Frontend Development
- React: https://react.dev
- Vite: https://vitejs.dev
- TailwindCSS: https://tailwindcss.com
- React Router: https://reactrouter.com

### For AI Integration
- Gemini API: https://ai.google.dev
- Node.js Fetch: https://nodejs.org

---

## 🚢 Deployment

### Ready for Deployment On:
- **Vercel** (Frontend only)
- **Heroku** (Full stack)
- **AWS** (EC2 + RDS)
- **Google Cloud** (Cloud Run + Cloud SQL)
- **Azure** (App Service + Cosmos DB)
- **DigitalOcean** (App Platform)
- **Docker** (Container deployment)

### Deployment Checklist
- [ ] Environment variables configured in deployment platform
- [ ] MongoDB cluster set up and accessible
- [ ] Gemini API key obtained and configured
- [ ] JWT secret generated and configured
- [ ] CORS origins updated for production domain
- [ ] Frontend API URL points to production backend
- [ ] HTTPS enabled
- [ ] Error logging configured
- [ ] Database backups enabled
- [ ] Monitoring and alerts set up

---

## 🤝 Contributing

To add features or fix bugs:

1. Create a branch: `git checkout -b feature/your-feature`
2. Make changes following the existing code style
3. Test thoroughly
4. Commit with clear messages
5. Push and create pull request

---

## 📝 Code Standards

### Backend
- Async/await for all async operations
- Middleware for cross-cutting concerns
- Services for business logic
- Controllers for routes only
- Models for database schemas
- Error handling on all endpoints

### Frontend
- Functional components with hooks
- Context API for global state
- Services for API calls
- Components are reusable
- Proper error boundaries
- Loading states on async operations

---

## 📞 Support

### Getting Help
1. **Read Documentation**: Check the relevant `.md` file
2. **Check Terminal Output**: Most errors are logged
3. **Browser DevTools**: Press F12 for frontend debugging
4. **MongoDB Compass**: Inspect database directly
5. **Network Tab**: Check API request/response

### Common Issues
- See [`SETUP_INSTRUCTIONS.md`](./SETUP_INSTRUCTIONS.md) - Common issues section
- See [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) - Troubleshooting matrix

---

## 📄 License

This project is provided as-is for educational and development purposes.

---

## 🎉 What's Included

✅ Complete backend with Gemini AI integration  
✅ Full-featured frontend with gamification  
✅ MongoDB database design  
✅ Authentication system  
✅ Error handling and fallbacks  
✅ Comprehensive documentation  
✅ Testing procedures  
✅ Performance optimization  

---

## 🚀 Get Started Now!

1. **Read**: [`QUICK_START.md`](./QUICK_START.md) (5 min read)
2. **Setup**: Run the 3 commands (2 min)
3. **Test**: Verify everything works (3 min)
4. **Build**: Add your own features!

---

## 📋 Checklist Before Going Live

- [ ] Read QUICK_START.md
- [ ] Set up environment variables (.env and .env.local)
- [ ] Start backend and frontend
- [ ] Test interview feature (critical!)
- [ ] Verify data saves to MongoDB
- [ ] Test all gamification features
- [ ] Check leaderboard functionality
- [ ] Test on mobile devices
- [ ] Configure production environment
- [ ] Set up monitoring and logging

---

**Version**: 1.0.0 - Production Ready  
**Last Updated**: Complete Enhancement & Testing  
**Status**: ✅ All Systems Operational  

**🎯 Your application is ready to run. Start with QUICK_START.md!**

---

### 📚 Documentation Files
- [`QUICK_START.md`](./QUICK_START.md) ← **Start here!**
- [`SETUP_INSTRUCTIONS.md`](./SETUP_INSTRUCTIONS.md)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md)  
- [`TESTING_GUIDE.md`](./TESTING_GUIDE.md)
- [`README.md`](./README.md) ← You are here

---

**Questions? Check the relevant documentation file first!**
