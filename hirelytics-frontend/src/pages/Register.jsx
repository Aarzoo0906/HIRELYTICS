import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppFooter } from "../components/AppFooter";
import { PageControls } from "../components/PageControls";

export const Register = () => {
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
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_18%),linear-gradient(180deg,#edfaff_0%,#f7fbff_42%,#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_18%),linear-gradient(180deg,#020617_0%,#082f49_44%,#020617_100%)]">
      <div className="sticky top-0 z-40">
        <PageControls backFallbackTo="/" />
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center p-4">
        <div className="mx-auto w-full max-w-md rounded-[1.8rem] border border-cyan-100 bg-[linear-gradient(145deg,#ffffff_0%,#f2fbff_100%)] p-8 shadow-[0_24px_70px_-48px_rgba(14,165,233,0.24)] dark:border-cyan-400/15 dark:bg-[linear-gradient(145deg,rgba(2,6,23,0.97)_0%,rgba(8,47,73,0.94)_100%)]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Create Account
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Join Hirelytics today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-xl border border-cyan-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-cyan-400/15 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-cyan-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-cyan-400/15 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-cyan-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-cyan-400/15 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-cyan-400"
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-[linear-gradient(135deg,#06b6d4_0%,#0ea5e9_48%,#2563eb_100%)] py-2.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-cyan-600 hover:underline dark:text-cyan-300"
          >
            Sign In
          </Link>
        </p>
        </div>
      </div>
      <AppFooter compact />
    </div>
  );
};
