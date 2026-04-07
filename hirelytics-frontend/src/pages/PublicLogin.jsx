import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppFooter } from "../components/AppFooter";
import { BrandLogo } from "../components/BrandLogo";
import { PageControls } from "../components/PageControls";
import { useAuth } from "../context/AuthContext";

export const PublicLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="public-auth-shell relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_20%),linear-gradient(180deg,#020617_0%,#082f49_42%,#1d4ed8_100%)]">
      <div className="sticky top-0 z-40">
        <PageControls backFallbackTo="/" className="border-cyan-300/20 bg-slate-950/95" />
      </div>

      <div className="flex-1 px-4 py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-400/12 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-blue-500/12 blur-3xl"></div>
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden rounded-[2rem] border border-cyan-300/20 bg-white/6 p-10 text-white shadow-2xl shadow-black/20 backdrop-blur-sm lg:block">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-2 shadow-lg shadow-cyan-500/10">
                <BrandLogo className="h-12 w-auto" alt="Hirelytics" priority />
              </div>
            </Link>

            <div className="mt-16 max-w-lg">
              <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">
                Welcome back
              </p>
              <h1 className="text-5xl leading-tight font-black">
                Log in and keep building your placement momentum.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-300">
                Continue with resume analysis, mock interviews, ATS tracking, and progress insights from your dashboard.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                ["Resume-ready", "Improve sections with guided feedback."],
                ["Interview-ready", "Practice technical and HR rounds."],
                ["Placement-ready", "Track progress and stay consistent."],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-md items-center">
            <div className="w-full rounded-[2rem] border border-cyan-300/20 bg-slate-900/90 p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="mb-8">
                <Link to="/" className="mb-5 inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.04] p-2.5">
                  <BrandLogo className="h-10 w-auto" alt="Hirelytics" priority />
                </Link>
                <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">Sign in</p>
                <h2 className="text-3xl font-black text-white">Welcome back to Hirelytics</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Continue your prep journey and pick up right where you left off.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-cyan-300/15 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-cyan-300/15 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400/60 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl bg-[linear-gradient(135deg,#22d3ee_0%,#0ea5e9_48%,#2563eb_100%)] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Sign In
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Do not have an account?{" "}
                <Link to="/register" className="font-semibold text-cyan-300 transition-colors hover:text-cyan-200">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>

      <AppFooter compact />
    </div>
  );
};

export default PublicLogin;
