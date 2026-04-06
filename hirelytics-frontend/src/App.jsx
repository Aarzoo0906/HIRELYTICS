import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { LandingPage } from "./pages/LandingPage";
import { PublicLogin } from "./pages/PublicLogin";
import { PublicRegister } from "./pages/PublicRegister";
import { Dashboard } from "./pages/Dashboard";
import { InterviewSelection } from "./pages/InterviewSelection";
import { Interview } from "./pages/Interview";
import { Result } from "./pages/Result";
import { Preparation } from "./pages/Preparation";
import { ResumeWorkbench } from "./pages/ResumeWorkbench";
import { Profile as AccountProfile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { VoicePractice } from "./pages/VoicePractice";
import {
  Profile as GamificationProfile,
  Leaderboard,
  Achievements,
} from "./pages/GamificationPages";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <PublicLogin />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <PublicRegister />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-selection"
            element={
              <ProtectedRoute>
                <InterviewSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <Interview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preparation"
            element={
              <ProtectedRoute>
                <Preparation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-analyzer"
            element={
              <ProtectedRoute>
                <ResumeWorkbench />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voice-practice"
            element={
              <ProtectedRoute>
                <VoicePractice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result"
            element={
              <ProtectedRoute>
                <Result />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <GamificationProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
