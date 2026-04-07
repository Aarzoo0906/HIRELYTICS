import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppFooter } from "../components/AppFooter";
import { PageControls } from "../components/PageControls";
import { useAuth } from "../context/AuthContext";

export const PublicRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="public-auth-shell relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_20%),linear-gradient(180deg,#020617_0%,#082f49_42%,#1d4ed8_100%)]">
      <div className="sticky top-0 z-40">
        <PageControls backFallbackTo="/" className="border-cyan-300/20 bg-slate-950/95" />
      </div>

      <div className="flex-1 px-4 py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-16 right-10 h-64 w-64 rounded-full bg-cyan-500/12 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-blue-500/12 blur-3xl"></div>
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden rounded-[2rem] border border-cyan-300/20 bg-white/6 p-10 text-white shadow-2xl shadow-black/20 backdrop-blur-sm lg:block">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#22d3ee_0%,#0ea5e9_58%,#2563eb_100%)] font-black text-white">
                H
              </div>
              <span className="text-xl font-bold tracking-tight">Hirelytics</span>
            </Link>

            <div className="mt-16 max-w-lg">
              <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">
                Start strong
              </p>
              <h1 className="text-5xl leading-tight font-black">
                Create your account and turn placement prep into a clear plan.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-300">
                Build an ATS-ready resume, practice interviews, and keep your progress in one student-friendly workspace.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {[
                "Guided resume building for freshers",
                "AI feedback on answers and bullet points",
                "Progress tracking that keeps you consistent",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                  <span className="text-teal-300">✓</span>
                  <span className="text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-md items-center">
            <div className="w-full rounded-[2rem] border border-cyan-300/20 bg-slate-900/90 p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="mb-8">
                <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">Create account</p>
                <h2 className="text-3xl font-black text-white">Join Hirelytics today</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Start free and get your placement prep dashboard ready in minutes.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-cyan-300/15 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400/60 focus:outline-none"
                  />
                </div>

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
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-cyan-300/15 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400/60 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl bg-[linear-gradient(135deg,#22d3ee_0%,#0ea5e9_48%,#2563eb_100%)] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Create Account
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-cyan-300 transition-colors hover:text-cyan-200">
                  Sign in
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

export default PublicRegister;
