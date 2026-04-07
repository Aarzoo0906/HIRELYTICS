import { useState } from "react";
import {
  Upload,
  FileText,
  Target,
  ScanSearch,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { AppFooter } from "../components/AppFooter";
import { PageClock } from "../components/PageClock";
import { PageHeader } from "../components/PageHeader";
import { Sidebar } from "../components/Sidebar";
import { API_BASE } from "../lib/api";

const scorePalette = (score) => {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });

export const ResumeAnalyzer = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError("Please upload a resume file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fileDataUrl = await readFileAsDataUrl(resumeFile);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/resume/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: resumeFile.name,
          fileDataUrl,
          targetRole,
          jobDescription,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Resume analysis failed.");
      }

      setAnalysis(data);
    } catch (analyzeError) {
      setError(analyzeError.message || "Resume analysis failed.");
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <PageClock />

          <PageHeader
            eyebrow="Resume Intelligence"
            title="Resume ATS Analyzer"
            description="Upload your resume, compare it against a target role or job description, and get ATS-style feedback you can act on immediately."
            icon={ScanSearch}
            backFallbackTo="/dashboard"
          />

          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Upload Resume
                  </h2>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Supports PDF, DOCX, and TXT. Add a role or JD for sharper ATS matching.
                  </p>
                </div>
                <div className="rounded-2xl bg-teal-50 p-3 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300">
                  <Upload size={24} />
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-teal-400 hover:bg-teal-50/50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-teal-600 dark:hover:bg-teal-950/20">
                  <Upload size={28} className="text-teal-600 dark:text-teal-400" />
                  <span className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {resumeFile ? resumeFile.name : "Choose your resume file"}
                  </span>
                  <span className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Click to browse and upload your latest resume.
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    className="hidden"
                    onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                  />
                </label>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Target Role
                  </label>
                  <input
                    value={targetRole}
                    onChange={(event) => setTargetRole(event.target.value)}
                    placeholder="Example: Frontend Developer"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    rows={8}
                    placeholder="Paste the job description here for more realistic ATS keyword analysis."
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3.5 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ScanSearch size={18} />
                  {loading ? "Analyzing Resume..." : "Analyze Resume"}
                </button>
              </div>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                What this checks
              </h2>
              <div className="mt-5 space-y-4">
                {[
                  "ATS-friendly section structure",
                  "Keyword coverage for the role or pasted JD",
                  "Bullet quality and measurable impact",
                  "Readability and recruiter scanability",
                  "Practical rewrite suggestions for weaker bullets",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 text-teal-600 dark:text-teal-400" size={18} />
                    <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          {analysis && (
            <section className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                {[
                  ["Overall", analysis.scores.overall],
                  ["ATS", analysis.scores.ats],
                  ["Keywords", analysis.scores.keywordAlignment],
                  ["Impact", analysis.scores.impact],
                  ["Readability", analysis.scores.readability],
                  ["Structure", analysis.scores.structure],
                ].map(([label, score]) => (
                  <article
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
                    <p className={`mt-2 text-3xl font-bold ${scorePalette(score)}`}>{score}</p>
                  </article>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <FileText className="text-teal-600 dark:text-teal-400" size={22} />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        Analysis Summary
                      </h3>
                    </div>
                    <p className="mt-4 text-slate-700 dark:text-slate-300">{analysis.summary}</p>
                    <div className="mt-4 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Recruiter View
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {analysis.recruiterView}
                      </p>
                    </div>
                  </section>

                  <section className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Strengths
                      </h3>
                      <div className="mt-4 space-y-3">
                        {analysis.strengths.map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 text-emerald-600 dark:text-emerald-400" size={18} />
                            <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Improve Next
                      </h3>
                      <div className="mt-4 space-y-3">
                        {analysis.improvements.map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 text-amber-600 dark:text-amber-400" size={18} />
                            <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <Target className="text-teal-600 dark:text-teal-400" size={22} />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        Bullet Rewrites
                      </h3>
                    </div>
                    <div className="mt-5 space-y-4">
                      {analysis.rewrittenBullets.length ? (
                        analysis.rewrittenBullets.map((item, index) => (
                          <article
                            key={`${item.before}-${index}`}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950"
                          >
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Before
                            </p>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{item.before}</p>
                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                              Better Version
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{item.after}</p>
                            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{item.why}</p>
                          </article>
                        ))
                      ) : (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          No bullet rewrites were generated for this resume yet.
                        </p>
                      )}
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      ATS Checks
                    </h3>
                    <div className="mt-4 space-y-3">
                      {analysis.atsChecks.map((item) => (
                        <article
                          key={item.label}
                          className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                        >
                          <div className="flex items-start gap-3">
                            {item.passed ? (
                              <CheckCircle2 className="mt-0.5 text-emerald-600 dark:text-emerald-400" size={18} />
                            ) : (
                              <AlertTriangle className="mt-0.5 text-amber-600 dark:text-amber-400" size={18} />
                            )}
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {item.label}
                              </p>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {item.detail}
                              </p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Missing Keywords
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {analysis.missingKeywords.length ? (
                        analysis.missingKeywords.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          No major missing keywords were detected from the provided role context.
                        </p>
                      )}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Resume Stats
                    </h3>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {[
                        ["Words", analysis.resumeStats.wordCount],
                        ["Bullets", analysis.resumeStats.bulletCount],
                        ["Quantified", analysis.resumeStats.quantifiedBulletCount],
                        ["Action Verbs", analysis.resumeStats.actionVerbCoverage],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
                          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </section>
          )}

          <AppFooter />
        </div>
      </main>
    </div>
  );
};

export default ResumeAnalyzer;
