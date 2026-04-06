import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AppFooter } from "../components/AppFooter";
import { BrandLogo } from "../components/BrandLogo";
import { PageControls } from "../components/PageControls";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = ["Features", "How It Works", "Templates", "Pricing", "FAQ"];

const PAIN_POINTS = [
  {
    icon: "🤷",
    title: "No idea what recruiters want",
    desc: "Job descriptions feel vague and you do not know what skills to highlight.",
  },
  {
    icon: "📄",
    title: "Resume not getting shortlisted",
    desc: "You apply to dozens of jobs and hear nothing back.",
  },
  {
    icon: "😰",
    title: "Interview anxiety takes over",
    desc: "You know the answers but freeze under pressure.",
  },
  {
    icon: "🌀",
    title: "No structured prep plan",
    desc: "You do not know where to start or what to practice.",
  },
  {
    icon: "🤖",
    title: "ATS feels like a black box",
    desc: "You have never understood why your resume gets filtered out automatically.",
  },
];

const FEATURES = [
  {
    icon: "🔍",
    title: "AI Resume Analyzer",
    desc: "Deep analysis of your resume with recruiter-style feedback on every section.",
  },
  {
    icon: "✏️",
    title: "Resume Builder",
    desc: "Build a polished, ATS-ready resume from scratch with guided templates.",
  },
  {
    icon: "✨",
    title: "Resume Improver",
    desc: "Paste your existing resume and get targeted rewrites for each bullet point.",
  },
  {
    icon: "🎤",
    title: "Mock Interview Practice",
    desc: "Answer role-specific questions and get AI feedback on your responses.",
  },
  {
    icon: "💡",
    title: "Question Generator",
    desc: "Get 50+ interview questions tailored to your target role and experience level.",
  },
  {
    icon: "📊",
    title: "ATS Score Estimator",
    desc: "See how your resume performs against ATS filters before you apply.",
  },
  {
    icon: "🔑",
    title: "Keyword Matching",
    desc: "Paste a job description and instantly see matched and missing keywords.",
  },
  {
    icon: "📝",
    title: "Bullet Suggestions",
    desc: "Turn weak job descriptions into strong, metric-driven achievement statements.",
  },
  {
    icon: "📈",
    title: "Progress Tracking",
    desc: "Watch your resume score and interview confidence improve over time.",
  },
  {
    icon: "🏆",
    title: "Leaderboard and Badges",
    desc: "Earn achievements as you practice and climb the placement-ready leaderboard.",
  },
  {
    icon: "🎙️",
    title: "Voice Practice",
    desc: "Improve speaking confidence with guided paragraphs, AI questions, and communication feedback.",
  },
  {
    icon: "📚",
    title: "Preparation Notes",
    desc: "Study categorized interview notes, mark progress, and earn points as you complete topics.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Upload or Create",
    desc: "Start with your existing resume or build one from scratch using our guided builder.",
  },
  {
    num: "02",
    title: "Get Feedback",
    desc: "Receive ATS score, keyword gaps, formatting issues, and recruiter-style suggestions.",
  },
  {
    num: "03",
    title: "Practice Interviews",
    desc: "Answer role-based questions with timed sessions and get AI feedback on your answers.",
  },
  {
    num: "04",
    title: "Track and Improve",
    desc: "Monitor your progress, earn badges, and become fully placement-ready.",
  },
];

const TEMPLATES = [
  { name: "Modern", color: "from-teal-400 to-cyan-500", lines: [70, 55, 80, 45, 65] },
  { name: "Professional", color: "from-blue-500 to-indigo-600", lines: [60, 75, 50, 80, 55] },
  { name: "ATS Strict", color: "from-emerald-500 to-teal-600", lines: [85, 60, 70, 55, 75] },
  { name: "Minimal", color: "from-slate-400 to-slate-600", lines: [50, 65, 45, 70, 60] },
  { name: "Executive", color: "from-violet-500 to-purple-600", lines: [75, 50, 85, 60, 70] },
];

const PLANS = [
  {
    name: "Free",
    price: "Free",
    highlight: "Everything currently available on Hirelytics",
    cta: "Start Free",
    featured: true,
    features: [
      "Full resume workbench",
      "ATS analysis and keyword matching",
      "Mock interview practice",
      "Progress tracking and achievements",
    ],
  },
];

const FAQS = [
  {
    q: "Is the ATS score exact?",
    a: "No ATS score online is 100% exact. Our score gives you a strong directional estimate based on keywords, formatting, and structure that mirrors common ATS behavior.",
  },
  {
    q: "Is Hirelytics useful for freshers with no experience?",
    a: "Yes. Hirelytics is built for students and freshers, helping you present projects, internships, and skills clearly even without full-time experience.",
  },
  {
    q: "Can I create a resume from scratch?",
    a: "Yes. The guided resume builder walks you through every section with tips and examples so you can build an ATS-friendly resume quickly.",
  },
  {
    q: "Does it support both technical and HR interview rounds?",
    a: "Yes. You can practice technical, HR, and mixed interview rounds with targeted feedback for each response.",
  },
  {
    q: "Can I improve my existing resume?",
    a: "Yes. Upload your current resume and get suggestions for weak bullets, missing keywords, and formatting issues.",
  },
];

const CHATBOT_RESPONSES = {
  "how do i start": "Start with the resume builder or ATS analyzer, then move into interview practice and preparation notes.",
  "is hirelytics free": "Yes. The current Hirelytics experience is free for students and freshers.",
  "how does voice practice work": "Voice Practice lets you read a paragraph or answer a question, then get transcript-based communication feedback.",
  "how do i get points": "You earn points from interview performance, voice practice performance, and completing preparation notes.",
  "how do i contact developers": "Use the support contact options in Hirelytics to reach the team directly.",
};

function TemplateArt({ name, color }) {
  const isClassic = name === "Classic";
  const isProfessional = name === "Professional";
  const isExecutive = name === "Executive";
  const isMinimal = name === "Minimal";

  return (
    <div className={`h-32 bg-gradient-to-br ${color} p-3 opacity-90`}>
      <div className="mx-auto flex h-full max-w-[120px] rounded-md bg-white/95 p-2 shadow-lg">
        {isProfessional || isExecutive ? (
          <>
            <div className="w-1/3 rounded-sm bg-slate-900/85" />
            <div className="ml-2 flex-1 space-y-1.5">
              <div className="h-2 w-3/4 rounded bg-slate-300" />
              <div className="h-1.5 w-full rounded bg-slate-200" />
              <div className="h-1.5 w-5/6 rounded bg-slate-200" />
              <div className="h-1.5 w-2/3 rounded bg-slate-200" />
            </div>
          </>
        ) : isClassic ? (
          <div className="w-full space-y-1.5">
            <div className="h-2 w-4/5 rounded bg-slate-700" />
            <div className="h-0.5 w-full bg-slate-400" />
            <div className="h-1.5 w-full rounded bg-slate-200" />
            <div className="h-1.5 w-5/6 rounded bg-slate-200" />
            <div className="h-1.5 w-3/4 rounded bg-slate-200" />
          </div>
        ) : isMinimal ? (
          <div className="w-full space-y-2">
            <div className="h-2 w-2/3 rounded bg-slate-600" />
            <div className="h-1.5 w-full rounded bg-slate-200" />
            <div className="h-1.5 w-4/5 rounded bg-slate-200" />
            <div className="h-1.5 w-3/5 rounded bg-slate-200" />
          </div>
        ) : (
          <>
            <div className="w-2/5 space-y-1.5">
              <div className="h-1.5 w-full rounded bg-slate-300" />
              <div className="h-1.5 w-5/6 rounded bg-slate-300" />
              <div className="h-1.5 w-4/6 rounded bg-slate-300" />
            </div>
            <div className="ml-2 flex-1 space-y-1.5">
              <div className="h-2 w-3/4 rounded bg-slate-700" />
              <div className="h-1.5 w-full rounded bg-slate-200" />
              <div className="h-1.5 w-5/6 rounded bg-slate-200" />
              <div className="h-1.5 w-2/3 rounded bg-slate-200" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function ScoreMeter({ score = 78, animate = false }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!animate) {
      return undefined;
    }

    let step = 0;
    const timer = window.setInterval(() => {
      step += 2;
      setDisplayed(Math.min(step, score));

      if (step >= score) {
        window.clearInterval(timer);
      }
    }, 20);

    return () => window.clearInterval(timer);
  }, [animate, score]);

  const value = animate ? displayed : score;
  const color = value >= 80 ? "#10b981" : value >= 60 ? "#f59e0b" : "#ef4444";
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * (value / 100);

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 0.05s" }}
        />
        <text x="70" y="65" textAnchor="middle" fill="white" fontSize="26" fontWeight="700">
          {value}
        </text>
        <text x="70" y="82" textAnchor="middle" fill="#94a3b8" fontSize="12">
          /100
        </text>
      </svg>
      <span className="mt-1 text-xs text-slate-400">ATS Score</span>
    </div>
  );
}

function LandingNavbar({ isAuthenticated }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-1.5 shadow-lg shadow-cyan-500/10">
            <BrandLogo
              className="h-8 w-auto sm:h-9"
              alt="Hirelytics"
              priority
            />
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-slate-200/90 transition-colors hover:text-white"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="px-3 py-1.5 text-sm text-slate-100 transition-colors hover:text-white"
          >
            {isAuthenticated ? "Dashboard" : "Log in"}
          </Link>
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {isAuthenticated ? "Continue" : "Start Free"}
          </Link>
        </div>

        <button
          type="button"
          className="p-2 text-slate-200 md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label="Toggle navigation menu"
        >
          <div className="mb-1 h-0.5 w-5 bg-current"></div>
          <div className="mb-1 h-0.5 w-5 bg-current"></div>
          <div className="h-0.5 w-5 bg-current"></div>
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-white/5 bg-slate-900 px-4 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <div key={link}>
              <a
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="block text-sm text-slate-100"
                onClick={() => setOpen(false)}
              >
                {link}
              </a>
            </div>
          ))}
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="block text-sm text-slate-100"
            onClick={() => setOpen(false)}
          >
            {isAuthenticated ? "Dashboard" : "Log in"}
          </Link>
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="mt-2 block w-full rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 py-2 text-center text-sm font-medium text-white"
            onClick={() => setOpen(false)}
          >
            {isAuthenticated ? "Continue" : "Start Free"}
          </Link>
        </div>
      )}
    </nav>
  );
}

function Hero({ primaryLink }) {
  const [ref, inView] = useInView(0.1);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 pt-24 pb-16"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-teal-500/8 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-emerald-500/6 blur-3xl"></div>
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-cyan-500/6 blur-3xl"></div>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="text-center lg:text-left">
            <div
              className={`mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400"></span>
              <span className="text-xs font-medium text-teal-300">Free for students and freshers</span>
            </div>

            <h1
              className={`mb-5 text-4xl leading-tight font-black text-white transition-all duration-700 delay-100 sm:text-5xl md:text-6xl ${inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              From resume confusion
              <br />
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                to interview confidence
              </span>
            </h1>

            <p
              className={`mx-auto mb-8 max-w-xl text-lg text-slate-400 transition-all duration-700 delay-200 lg:mx-0 ${inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              AI-powered resume analysis, mock interviews, and progress tracking in one platform built to help students become placement-ready.
            </p>

            <div
              className={`mb-2 flex flex-col items-center justify-center gap-3 transition-all duration-700 delay-300 sm:flex-row lg:justify-start ${inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              <Link
                to={primaryLink}
                className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-opacity hover:opacity-90 sm:w-auto"
              >
                Start Free
              </Link>
              <a
                href="#features"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Explore Features
              </a>
            </div>
          </div>

          <div
            className={`relative flex justify-center transition-all duration-700 delay-400 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} lg:justify-end`}
          >
            <div className="absolute inset-x-6 top-8 h-48 rounded-full bg-cyan-400/12 blur-3xl sm:inset-x-10 sm:h-64 lg:inset-x-0"></div>
            <div className="relative rounded-[2rem] border border-cyan-400/20 bg-slate-900/70 p-4 shadow-[0_25px_80px_-30px_rgba(34,211,238,0.5)] backdrop-blur-sm sm:p-6">
              <BrandLogo
                className="h-auto w-full max-w-[320px] drop-shadow-[0_25px_40px_rgba(34,211,238,0.18)] sm:max-w-[420px] lg:max-w-[500px]"
                alt="Hirelytics platform logo"
                priority
              />
            </div>
          </div>
        </div>

        <div
          className={`mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl transition-all duration-700 delay-500 ${inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/60"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/60"></div>
            <span className="ml-2 text-xs text-slate-500">hirelytics.app/dashboard</span>
          </div>
          <div className="grid grid-cols-3 gap-3 p-4">
            <div className="col-span-1 flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-800/60 p-3">
              <ScoreMeter score={82} animate={inView} />
            </div>
            <div className="col-span-2 space-y-2">
              <div className="rounded-xl bg-slate-800/60 p-3">
                <div className="mb-2 text-xs text-slate-400">Latest feedback</div>
                <div className="space-y-1.5">
                  {[
                    ["Missing keywords: TypeScript, AWS", "text-red-400"],
                    ["Strong action verbs used", "text-emerald-400"],
                    ["Add 2 more metrics to bullets", "text-yellow-400"],
                  ].map(([text, color], index) => (
                    <div key={index} className={`flex items-center gap-1.5 text-xs ${color}`}>
                      <span>•</span>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-800/60 p-3 text-center">
                  <div className="text-xl font-black text-white">14</div>
                  <div className="text-xs text-slate-400">Interviews done</div>
                </div>
                <div className="rounded-xl bg-slate-800/60 p-3 text-center">
                  <div className="text-xl font-black text-emerald-400">7 Day</div>
                  <div className="text-xs text-slate-400">Consistency streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PainPoints({ primaryLink }) {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="bg-slate-950 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <p className="mb-3 text-sm font-semibold tracking-widest text-teal-400 uppercase">Sound familiar?</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Every student hits these walls</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PAIN_POINTS.map((point, index) => (
            <div
              key={point.title}
              className={`group cursor-default rounded-2xl border border-white/8 bg-slate-900 p-5 transition-all duration-500 hover:border-teal-500/30 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="mb-3 text-3xl">{point.icon}</div>
              <h3 className="mb-1.5 text-sm font-semibold text-white">{point.title}</h3>
              <p className="text-xs leading-relaxed text-slate-400">{point.desc}</p>
            </div>
          ))}
          <div
            className={`flex flex-col justify-center rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/15 to-emerald-500/10 p-5 transition-all duration-500 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
            style={{ transitionDelay: "400ms" }}
          >
            <p className="mb-2 text-sm font-semibold text-teal-300">Hirelytics fixes all of these</p>
            <p className="text-xs leading-relaxed text-slate-400">
              One platform for your resume, ATS score, interview practice, and progress tracking.
            </p>
            <Link
              to={primaryLink}
              className="mt-4 w-fit rounded-lg bg-teal-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-teal-400"
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const [ref, inView] = useInView();

  return (
    <section id="features" ref={ref} className="bg-slate-900 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <p className="mb-3 text-sm font-semibold tracking-widest text-teal-400 uppercase">Everything you need</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">12 tools. One platform.</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className={`cursor-default rounded-xl border border-white/6 bg-slate-800/50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-500/25 hover:bg-slate-800 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className="mb-2 text-2xl">{feature.icon}</div>
              <h3 className="mb-1 text-sm font-semibold text-white">{feature.title}</h3>
              <p className="text-xs leading-relaxed text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const [ref, inView] = useInView();

  return (
    <section id="how-it-works" ref={ref} className="bg-slate-950 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div
          className={`mb-14 text-center transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <p className="mb-3 text-sm font-semibold tracking-widest text-teal-400 uppercase">Simple process</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Go from 0 to placement-ready</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div
              key={step.num}
              className={`relative transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              {index < STEPS.length - 1 && (
                <div className="absolute top-7 left-full z-10 hidden h-px w-full bg-gradient-to-r from-teal-500/40 to-transparent lg:block"></div>
              )}
              <div className="rounded-2xl border border-white/8 bg-slate-900 p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-sm font-black text-slate-900">
                  {step.num}
                </div>
                <h3 className="mb-2 text-sm font-bold text-white">{step.title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplatesSection({ primaryLink }) {
  const [ref, inView] = useInView();

  return (
    <section id="templates" ref={ref} className="bg-slate-950 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <p className="mb-3 text-sm font-semibold tracking-widest text-teal-400 uppercase">Resume templates</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Pick a template, start in seconds</h2>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TEMPLATES.map((template, index) => (
            <div
              key={template.name}
              className={`group cursor-pointer transition-all duration-500 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="overflow-hidden rounded-xl border border-white/8 bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/40">
                <TemplateArt name={template.name} color={template.color} />
                <div className="px-3 py-2">
                  <span className="text-xs font-medium text-slate-300 transition-colors group-hover:text-white">
                    {template.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to={primaryLink}
            className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-opacity hover:opacity-90"
          >
            Create Resume Fast
          </Link>
        </div>
      </div>
    </section>
  );
}

function HelpBotSection() {
  const [ref, inView] = useInView();
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState(
    "Ask a saved question like 'How do I start?' or 'How do I get points?'",
  );

  const handleAsk = () => {
    const normalized = message.trim().toLowerCase();
    setAnswer(
      CHATBOT_RESPONSES[normalized] ||
        "I can answer saved questions about getting started, pricing, voice practice, points, and contacting the developers.",
    );
  };

  return (
    <section ref={ref} className="bg-slate-900 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div
          className={`mb-10 text-center transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <p className="mb-3 text-sm font-semibold tracking-widest text-teal-400 uppercase">Help Bot</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Quick answers from a simple chatbot</h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-xl">
          <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
            <div className="space-y-3">
              {Object.keys(CHATBOT_RESPONSES).map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => {
                    setMessage(question);
                    setAnswer(CHATBOT_RESPONSES[question]);
                  }}
                  className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-teal-500/40 hover:bg-white/10"
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="space-y-4 rounded-2xl border border-teal-500/20 bg-teal-500/10 p-5">
              <div className="rounded-2xl bg-slate-900/90 p-4 text-sm leading-7 text-slate-200">
                {answer}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type a saved question..."
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-teal-400"
                />
                <button
                  type="button"
                  onClick={handleAsk}
                  className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white"
                >
                  Ask Bot
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InterviewPrep() {
  const [ref, inView] = useInView();
  const questions = [
    {
      role: "Frontend",
      q: "Explain the difference between == and === in JavaScript.",
      diff: "Easy",
      type: "Technical",
    },
    {
      role: "HR",
      q: "Where do you see yourself in 5 years?",
      diff: "Medium",
      type: "HR",
    },
    {
      role: "Backend",
      q: "How would you design a URL shortener?",
      diff: "Hard",
      type: "System Design",
    },
  ];

  return (
    <section className="bg-slate-900 px-4 py-20" ref={ref}>
      <div className="mx-auto max-w-5xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <p className="mb-3 text-sm font-semibold tracking-widest text-teal-400 uppercase">Mock interviews</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Practice smarter, not harder</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
            Role-specific questions, timed sessions, and AI feedback on every answer you give.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div
                key={question.q}
                className={`rounded-xl border border-white/6 bg-slate-800/50 p-4 transition-all duration-500 hover:border-teal-500/25 ${inView ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"}`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${question.diff === "Easy" ? "bg-emerald-500/15 text-emerald-400" : question.diff === "Medium" ? "bg-yellow-500/15 text-yellow-400" : "bg-red-500/15 text-red-400"}`}
                  >
                    {question.diff}
                  </span>
                  <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-400">
                    {question.type}
                  </span>
                </div>
                <p className="mb-1 text-[11px] tracking-wide text-slate-500 uppercase">{question.role}</p>
                <p className="text-sm font-medium text-white">{question.q}</p>
              </div>
            ))}
          </div>

          <div
            className={`rounded-2xl border border-white/10 bg-slate-950 p-5 transition-all duration-700 delay-300 ${inView ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"}`}
          >
            <div className="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
              AI Feedback Preview
            </div>
            <div className="mb-3 rounded-xl bg-slate-800/60 p-4">
              <p className="text-xs italic text-slate-300">
                "Managed a team of developers and delivered a project on time..."
              </p>
              <p className="mt-1 text-xs text-slate-500">Your answer</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-emerald-400">
                <span>✓</span>
                <span>Good structure and a specific example.</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-yellow-400">
                <span>⚠</span>
                <span>Add a measurable outcome to strengthen the impact.</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-blue-400">
                <span>💡</span>
                <span>Use the STAR format: Situation, Task, Action, Result.</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">Answer score</span>
              <span className="text-sm font-bold text-teal-400">7.2 / 10</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressSection() {
  const [ref, inView] = useInView();
  const badges = ["First Resume", "7-Day Streak", "10 Interviews", "ATS 80+", "Top 10%"];
  const barStyles = {
    teal: "bg-teal-500",
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
  };

  return (
    <section ref={ref} className="bg-slate-950 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <p className="mb-3 text-sm font-semibold tracking-widest text-teal-400 uppercase">Dashboard</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Watch yourself grow</h2>
        </div>

        <div
          className={`overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition-all duration-700 delay-200 ${inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="flex items-center gap-1.5 border-b border-white/5 bg-slate-900 px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/60"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/60"></div>
            <span className="ml-2 text-xs text-slate-500">My Progress</span>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <ScoreMeter score={82} animate={inView} />
              <div className="mt-3 space-y-1">
                {[
                  ["Resume score", 82, "teal"],
                  ["Interview avg", 71, "blue"],
                  ["Keyword match", 54, "yellow"],
                ].map(([label, value, color]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-28 text-xs text-slate-400">{label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${barStyles[color]}`}
                        style={{ width: inView ? `${value}%` : "0%" }}
                      ></div>
                    </div>
                    <span className="w-6 text-right text-xs text-slate-400">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 sm:col-span-2">
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["14", "Interviews"],
                  ["7", "Day streak"],
                  ["Lv. 4", "Rank"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl bg-slate-800/60 p-3 text-center">
                    <div className="text-lg font-black text-white">{value}</div>
                    <div className="text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-slate-800/40 p-3">
                <div className="mb-2 text-xs font-medium tracking-wider text-slate-400 uppercase">Badges earned</div>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge, index) => (
                    <span
                      key={badge}
                      className={`rounded-lg border border-white/8 bg-slate-700/80 px-2.5 py-1 text-xs text-slate-300 transition-all duration-500 ${inView ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
                      style={{ transitionDelay: `${600 + index * 80}ms` }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  const [ref, inView] = useInView();
  const testimonials = [
    {
      name: "Priya S.",
      role: "BCA Graduate",
      text: "Got my resume ATS score from 48 to 84 in two days. The keyword suggestions actually worked.",
    },
    {
      name: "Rahul M.",
      role: "CS Student",
      text: "Practiced 30+ mock interviews here. The AI feedback helped me fix answers I did not know were weak.",
    },
    {
      name: "Anjali K.",
      role: "MCA Fresher",
      text: "Built my first proper resume in under 20 minutes and got shortlisted within a week.",
    },
  ];

  return (
    <section ref={ref} className="bg-slate-900 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <p className="mb-3 text-sm font-semibold tracking-widest text-teal-400 uppercase">Built for students</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Students are getting results</h2>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={`rounded-2xl border border-white/6 bg-slate-800/50 p-5 transition-all duration-500 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <p className="mb-4 text-sm leading-relaxed text-slate-300">"{testimonial.text}"</p>
              <div>
                <div className="text-sm font-semibold text-white">{testimonial.name}</div>
                <div className="text-xs text-slate-500">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Student-first", "Built for freshers and final-year students, not only experienced professionals."],
            ["ATS-aware", "Analysis based on how real ATS systems parse and score resumes."],
            ["Structured prep", "Cover every stage: resume, ATS, mock interviews, and progress."],
            ["Private and safe", "Your resume data stays private. No selling and no sharing."],
          ].map(([title, desc], index) => (
            <div
              key={title}
              className={`rounded-xl border border-white/6 bg-slate-800/40 p-4 transition-all duration-500 ${inView ? "opacity-100" : "opacity-0"}`}
              style={{ transitionDelay: `${300 + index * 80}ms` }}
            >
              <div className="mb-1 text-sm font-semibold text-white">{title}</div>
              <div className="text-xs leading-relaxed text-slate-400">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection({ primaryLink }) {
  const [ref, inView] = useInView();

  return (
    <section id="pricing" ref={ref} className="bg-slate-950 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <p className="mb-3 text-sm font-semibold tracking-widest text-teal-400 uppercase">Pricing</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Simple pricing for student budgets</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            Hirelytics is free for now, so you can explore every core feature without choosing a paid plan.
          </p>
        </div>

        <div className="mx-auto grid max-w-xl gap-4">
          {PLANS.map((plan, index) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 transition-all duration-500 ${plan.featured ? "border-teal-500/30 bg-gradient-to-b from-teal-500/10 to-slate-900 shadow-lg shadow-teal-500/10" : "border-white/8 bg-slate-900"} ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <div className="mb-5">
                {plan.featured && (
                  <span className="mb-3 inline-flex rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-teal-300 uppercase">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <div className="mt-2 text-3xl font-black text-white">{plan.price}</div>
                <p className="mt-2 text-sm text-slate-400">{plan.highlight}</p>
              </div>

              <div className="mb-6 space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-0.5 text-teal-400">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                to={primaryLink}
                className={`block rounded-xl px-4 py-3 text-center text-sm font-semibold transition-opacity ${plan.featured ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-90" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [ref, inView] = useInView();
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" ref={ref} className="bg-slate-950 px-4 py-20">
      <div className="mx-auto max-w-2xl">
        <div
          className={`mb-12 text-center transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <p className="mb-3 text-sm font-semibold tracking-widest text-teal-400 uppercase">FAQ</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Questions students ask</h2>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, index) => (
            <div
              key={faq.q}
              className={`overflow-hidden rounded-xl border transition-all duration-500 ${open === index ? "border-teal-500/30" : "border-white/6"} ${inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpen(open === index ? null : index)}
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <span className={`text-lg text-teal-400 transition-transform ${open === index ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>
              {open === index && (
                <div className="border-t border-white/5 px-5 pt-3 pb-4 text-sm leading-relaxed text-slate-400">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ primaryLink, secondaryLink }) {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="bg-slate-900 px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className={`transition-all duration-700 ${inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400"></span>
            <span className="text-xs font-medium text-teal-300">Free to start and built for campus placements</span>
          </div>
          <h2 className="mb-5 text-4xl font-black text-white sm:text-5xl">
            Start building your
            <br />
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              job-ready profile today
            </span>
          </h2>
          <p className="mx-auto mb-8 max-w-md text-base text-slate-400">
            Your resume, ATS score, mock interviews, and progress all in one place.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={primaryLink}
              className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-opacity hover:opacity-90 sm:w-auto"
            >
              Create My Resume
            </Link>
            <Link
              to={secondaryLink}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              Practice Interview
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CreatorSection() {
  return (
    <section className="bg-slate-900 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold tracking-widest text-teal-400 uppercase">Built by students</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Meet the team behind Hirelytics</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            A student-first platform shaped around clear resumes, calmer interviews, and more visible progress.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              initials: "AK",
              name: "Aditya Kanaujiya",
              role: "Full stack Developer",
              text: "Focused on platform logic, interview flow, and keeping the preparation journey practical.",
            },
            {
              initials: "AS",
              name: "Aarzoo Singh",
              role: "Full stack Developer",
              text: "Focused on usability, visual structure, and making the prep experience easier to navigate.",
            },
          ].map((creator) => (
            <article
              key={creator.name}
              className="rounded-3xl border border-white/8 bg-slate-800/70 p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-lg font-black text-slate-900">
                  {creator.initials}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{creator.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-teal-100">{creator.role}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{creator.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export const LandingPage = () => {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const primaryLink = isAuthenticated ? "/dashboard" : "/register";
  const secondaryLink = isAuthenticated ? "/interview-selection" : "/login";

  return (
    <div className="landing-shell flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-white">
      <LandingNavbar isAuthenticated={isAuthenticated} />
      <div className="sticky top-16 z-40">
        <PageControls backFallbackTo={isAuthenticated ? "/dashboard" : "/"} />
      </div>
      <Hero primaryLink={primaryLink} />
      <PainPoints primaryLink={primaryLink} />
      <FeaturesSection />
      <HowItWorks />
      <TemplatesSection primaryLink={primaryLink} />
      <InterviewPrep />
      <ProgressSection />
      <TrustSection />
      <PricingSection primaryLink={primaryLink} />
      <FAQSection />
      <HelpBotSection />
      <CreatorSection />
      <FinalCTA primaryLink={primaryLink} secondaryLink={secondaryLink} />
      <AppFooter compact />

      {!isAuthenticated && (
        <div className="fixed right-4 bottom-4 left-4 z-50 sm:hidden">
          <Link
            to="/register"
            className="block w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 py-3.5 text-center text-sm font-semibold text-white shadow-xl shadow-teal-500/30 transition-opacity hover:opacity-90"
          >
            Start Free
          </Link>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
