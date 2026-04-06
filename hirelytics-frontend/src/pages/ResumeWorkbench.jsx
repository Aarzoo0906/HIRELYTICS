import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Upload,
  FileText,
  Target,
  ScanSearch,
  CheckCircle2,
  AlertTriangle,
  WandSparkles,
  Sparkles,
  BadgeCheck,
  Maximize2,
  X,
  Download,
} from "lucide-react";
import { AppFooter } from "../components/AppFooter";
import { PageClock } from "../components/PageClock";
import { PageHeader } from "../components/PageHeader";
import { ResumeTemplatePreview } from "../components/ResumeTemplatePreview";
import { Sidebar } from "../components/Sidebar";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

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

const TEMPLATE_OPTIONS = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean one-column layout with teal accent and balanced spacing.",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Formal ATS-safe structure with strong headings and traditional styling.",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium dark-header layout for strong leadership and polished profiles.",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Two-column fast-scan layout for students and early-career candidates.",
  },
  {
    id: "ats_strict",
    name: "ATS Strict",
    description: "Minimal formatting focused on machine readability and keyword scanning.",
  },
];

const renderTemplatePreviewCard = (templateId = "modern") => {
  const accentMap = {
    modern: "from-teal-500 to-cyan-500",
    classic: "from-slate-600 to-slate-800",
    executive: "from-amber-500 to-slate-900",
    compact: "from-indigo-500 to-sky-500",
    ats_strict: "from-emerald-500 to-teal-700",
  };

  return (
    <div className={`mb-4 h-32 rounded-2xl bg-gradient-to-br ${accentMap[templateId] || accentMap.modern} p-3`}>
      <div className="mx-auto flex h-full max-w-[150px] rounded-lg bg-white/95 p-2 shadow-lg">
        {templateId === "executive" || templateId === "modern" ? (
          <>
            <div className="w-1/3 rounded-md bg-slate-900/85" />
            <div className="ml-2 flex-1 space-y-1.5">
              <div className="h-2 w-3/4 rounded bg-slate-400" />
              <div className="h-1.5 w-full rounded bg-slate-200" />
              <div className="h-1.5 w-5/6 rounded bg-slate-200" />
              <div className="h-1.5 w-3/5 rounded bg-slate-200" />
            </div>
          </>
        ) : templateId === "compact" ? (
          <>
            <div className="w-2/5 space-y-1.5">
              <div className="h-1.5 w-full rounded bg-slate-300" />
              <div className="h-1.5 w-5/6 rounded bg-slate-300" />
              <div className="h-1.5 w-4/6 rounded bg-slate-300" />
            </div>
            <div className="ml-2 flex-1 space-y-1.5">
              <div className="h-2 w-3/4 rounded bg-slate-600" />
              <div className="h-1.5 w-full rounded bg-slate-200" />
              <div className="h-1.5 w-5/6 rounded bg-slate-200" />
              <div className="h-1.5 w-3/5 rounded bg-slate-200" />
            </div>
          </>
        ) : (
          <div className="w-full space-y-1.5">
            <div className="h-2 w-4/5 rounded bg-slate-700" />
            <div className="h-0.5 w-full bg-slate-400" />
            <div className="h-1.5 w-full rounded bg-slate-200" />
            <div className="h-1.5 w-5/6 rounded bg-slate-200" />
            <div className="h-1.5 w-3/4 rounded bg-slate-200" />
          </div>
        )}
      </div>
    </div>
  );
};

export const ResumeWorkbench = () => {
  const previewRef = useRef(null);
  const generatedPreviewRef = useRef(null);
  const [activeTab, setActiveTab] = useState("analyze");
  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [improving, setImproving] = useState(false);
  const [improvedResume, setImprovedResume] = useState(null);
  const [builderLoading, setBuilderLoading] = useState(false);
  const [builtResume, setBuiltResume] = useState(null);
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
  const [improveConfig, setImproveConfig] = useState({
    tone: "professional",
    templateStyle: "modern",
    priority: "balanced",
    outputLength: "one_page",
    targetCompanies: "",
    mustKeep: "",
    extraInstructions: "",
  });
  const [builderForm, setBuilderForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    summary: "",
    skills: "",
    experience: "",
    projects: "",
    education: "",
    certifications: "",
    achievements: "",
    yearsExperience: "",
    currentTitle: "",
    targetCompanies: "",
    mustIncludeKeywords: "",
    tone: "professional",
    templateStyle: "modern",
    outputLength: "one_page",
    seniority: "mid",
    industry: "",
    internships: "",
    leadership: "",
    customInstructions: "",
    targetRole: "",
    jobDescription: "",
  });

  const getActivePreviewElement = () =>
    builtResume ? generatedPreviewRef.current : previewRef.current;

  const handleExportPdf = async (targetElement = getActivePreviewElement()) => {
    if (!targetElement) {
      setError("Resume preview is not ready for export yet.");
      return;
    }

    try {
      const canvas = await html2canvas(targetElement, {
        scale: 2.2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let remainingHeight = imgHeight;
      let position = 0;

      pdf.addImage(imageData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      remainingHeight -= pageHeight;

      while (remainingHeight > 0) {
        position = remainingHeight - imgHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        remainingHeight -= pageHeight;
      }

      pdf.save(`${(builderForm.fullName || "resume").replace(/\s+/g, "-").toLowerCase()}.pdf`);
    } catch {
      setError("Unable to export PDF right now. Please try again.");
    }
  };

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
      if (!response.ok) throw new Error(data?.message || "Resume analysis failed.");
      setAnalysis(data);
      setImprovedResume(null);
    } catch (analyzeError) {
      setError(analyzeError.message || "Resume analysis failed.");
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!analysis?.extractedResumeText) {
      setError("Analyze a resume first before improving it.");
      return;
    }

    setImproving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/resume/improve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeText: analysis.extractedResumeText,
          targetRole,
          jobDescription,
          focusAreas: analysis.improvements,
          ...improveConfig,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Resume improvement failed.");
      setImprovedResume(data);
    } catch (improveError) {
      setError(improveError.message || "Resume improvement failed.");
    } finally {
      setImproving(false);
    }
  };

  const handleBuildResume = async () => {
    setBuilderLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/resume/build`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(builderForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Resume generation failed.");
      setBuiltResume(data);
      setIsFullPreviewOpen(true);
    } catch (buildError) {
      setError(buildError.message || "Resume generation failed.");
    } finally {
      setBuilderLoading(false);
    }
  };

  const generatedPreviewData = builtResume?.structuredResume || builderForm;
  const generatedTemplateStyle = builtResume?.templateStyle || builderForm.templateStyle;

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <PageClock />

          <PageHeader
            eyebrow="Resume Intelligence"
            title="Resume ATS Analyzer"
            description="Analyze existing resumes, generate a new ATS-friendly resume from scratch, and improve weak resumes in one place."
            icon={ScanSearch}
            backFallbackTo="/dashboard"
          />

          <section className="flex flex-wrap gap-3">
            {[
              { id: "analyze", label: "Analyze Resume" },
              { id: "builder", label: "Resume Maker" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-teal-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </section>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {activeTab === "analyze" ? (
            <section className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
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
                        placeholder="Paste the job description here for better ATS keyword analysis."
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Improve Tone
                        </label>
                        <select
                          value={improveConfig.tone}
                          onChange={(event) =>
                            setImproveConfig((current) => ({
                              ...current,
                              tone: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                          <option value="professional">Professional</option>
                          <option value="confident">Confident</option>
                          <option value="technical">Technical</option>
                          <option value="executive">Executive</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Template Style
                        </label>
                        <select
                          value={improveConfig.templateStyle}
                          onChange={(event) =>
                            setImproveConfig((current) => ({
                              ...current,
                              templateStyle: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                          <option value="modern">Modern</option>
                          <option value="classic">Classic</option>
                          <option value="executive">Executive</option>
                          <option value="compact">Compact</option>
                          <option value="ats_strict">ATS Strict</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Priority
                        </label>
                        <select
                          value={improveConfig.priority}
                          onChange={(event) =>
                            setImproveConfig((current) => ({
                              ...current,
                              priority: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                          <option value="balanced">Balanced</option>
                          <option value="ats_keywords">ATS Keywords</option>
                          <option value="impact_bullets">Impact Bullets</option>
                          <option value="recruiter_readability">Recruiter Readability</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Output Length
                        </label>
                        <select
                          value={improveConfig.outputLength}
                          onChange={(event) =>
                            setImproveConfig((current) => ({
                              ...current,
                              outputLength: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                          <option value="one_page">One Page</option>
                          <option value="one_to_two_pages">One To Two Pages</option>
                          <option value="compact">Compact</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Target Companies
                      </label>
                      <input
                        value={improveConfig.targetCompanies}
                        onChange={(event) =>
                          setImproveConfig((current) => ({
                            ...current,
                            targetCompanies: event.target.value,
                          }))
                        }
                        placeholder="Example: Google, Amazon, Infosys"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Must Keep
                      </label>
                      <textarea
                        rows={3}
                        value={improveConfig.mustKeep}
                        onChange={(event) =>
                          setImproveConfig((current) => ({
                            ...current,
                            mustKeep: event.target.value,
                          }))
                        }
                        placeholder="Mention lines, achievements, projects, or wording that must stay."
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Extra Instructions
                      </label>
                      <textarea
                        rows={3}
                        value={improveConfig.extraInstructions}
                        onChange={(event) =>
                          setImproveConfig((current) => ({
                            ...current,
                            extraInstructions: event.target.value,
                          }))
                        }
                        placeholder="Example: make it stronger for product companies, emphasize React, keep internship details."
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </div>

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

                <aside className="space-y-6 xl:sticky xl:top-24 self-start">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      What this checks
                    </h2>
                    <div className="mt-5 space-y-4">
                      {[
                        "ATS-friendly structure and contact details",
                        "Keyword match with role or job description",
                        "Impact language, metrics, and bullet quality",
                        "Formatting safety and readability",
                        "Improvement path if the score is weak",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 text-teal-600 dark:text-teal-400" size={18} />
                          <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {improvedResume ? (
                    <PrintableResumeText
                      title="Improved Resume"
                      subtitle="Ready-to-print draft shown on the right for quick review."
                      content={improvedResume.improvedResume}
                      templateStyle={improveConfig.templateStyle}
                    />
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <WandSparkles className="mx-auto text-slate-400" size={28} />
                      <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Improved resume will appear here
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Analyze a resume, then click `Improve Resume` to get a polished draft on the right side.
                      </p>
                    </div>
                  )}
                </aside>
              </div>

              {analysis && (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                    {[
                      ["Overall", analysis.scores.overall],
                      ["ATS Est.", analysis.scores.ats],
                      ["Confidence", analysis.scores.confidence],
                      ["Keywords", analysis.scores.keywordAlignment],
                      ["Impact", analysis.scores.impact],
                      ["Formatting", analysis.scores.formatting],
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

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                    {analysis.scoringNote}
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
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                              Improve Resume
                            </h3>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                              Use this when the ATS estimate is weak or the resume needs sharper wording.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleImprove}
                            disabled={improving}
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                          >
                            <WandSparkles size={16} />
                            {improving ? "Improving..." : "Improve Resume"}
                          </button>
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
                            <article key={item.label} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
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
                          Matched Keywords
                        </h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {analysis.matchedKeywords?.length ? (
                            analysis.matchedKeywords.map((item) => (
                              <span
                                key={item}
                                className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Strong keyword matches have not been detected yet.
                            </p>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                </>
              )}

              {improvedResume && (
                <section className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Changes Made</h3>
                      <div className="mt-4 space-y-3">
                        {improvedResume.changesMade.map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 text-emerald-600 dark:text-emerald-400" size={18} />
                            <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Improved Score</h3>
                      <p className={`mt-4 text-4xl font-bold ${scorePalette(improvedResume.improvedAnalysis.scores.overall)}`}>
                        {improvedResume.improvedAnalysis.scores.overall}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        ATS estimate: {improvedResume.improvedAnalysis.scores.ats} | Confidence: {improvedResume.improvedAnalysis.scores.confidence}
                      </p>
                    </section>
                  </div>

                  {!!improvedResume.keywordStrategy?.length && (
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Keyword Strategy
                      </h3>
                      <div className="mt-4 space-y-3">
                        {improvedResume.keywordStrategy.map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <Target className="mt-0.5 text-teal-600 dark:text-teal-400" size={18} />
                            <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </section>
              )}
            </section>
          ) : (
            <section className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        Build Resume From Scratch
                      </h2>
                      <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Fill the basics and generate an ATS-friendly draft tailored to your target role.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-teal-50 p-3 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300">
                      <Sparkles size={24} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {[
                      ["fullName", "Full Name"],
                      ["email", "Email"],
                      ["phone", "Phone"],
                      ["location", "Location"],
                      ["linkedin", "LinkedIn"],
                      ["github", "GitHub"],
                      ["currentTitle", "Current Title"],
                      ["yearsExperience", "Years Experience"],
                      ["industry", "Industry"],
                      ["targetCompanies", "Target Companies"],
                      ["targetRole", "Target Role"],
                    ].map(([key, label]) => (
                      <div key={key}>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {label}
                        </label>
                        <input
                          value={builderForm[key]}
                          onChange={(event) =>
                            setBuilderForm((current) => ({ ...current, [key]: event.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Seniority
                      </label>
                      <select
                        value={builderForm.seniority}
                        onChange={(event) =>
                          setBuilderForm((current) => ({
                            ...current,
                            seniority: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      >
                        <option value="fresher">Fresher</option>
                        <option value="junior">Junior</option>
                        <option value="mid">Mid</option>
                        <option value="senior">Senior</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Tone
                      </label>
                      <select
                        value={builderForm.tone}
                        onChange={(event) =>
                          setBuilderForm((current) => ({
                            ...current,
                            tone: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      >
                        <option value="professional">Professional</option>
                        <option value="confident">Confident</option>
                        <option value="technical">Technical</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Template Style
                      </label>
                      <select
                        value={builderForm.templateStyle}
                        onChange={(event) =>
                          setBuilderForm((current) => ({
                            ...current,
                            templateStyle: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      >
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                        <option value="executive">Executive</option>
                        <option value="compact">Compact</option>
                        <option value="ats_strict">ATS Strict</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Output Length
                      </label>
                      <select
                        value={builderForm.outputLength}
                        onChange={(event) =>
                          setBuilderForm((current) => ({
                            ...current,
                            outputLength: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      >
                        <option value="one_page">One Page</option>
                        <option value="one_to_two_pages">One To Two Pages</option>
                        <option value="compact">Compact</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {[
                      ["summary", "Professional Summary", 4],
                      ["skills", "Skills", 4],
                      ["experience", "Experience", 6],
                      ["internships", "Internships", 4],
                      ["projects", "Projects", 5],
                      ["leadership", "Leadership / Positions of Responsibility", 4],
                      ["education", "Education", 4],
                      ["certifications", "Certifications", 3],
                      ["achievements", "Achievements", 3],
                      ["mustIncludeKeywords", "Must Include Keywords", 3],
                      ["jobDescription", "Job Description", 6],
                      ["customInstructions", "Custom Instructions", 4],
                    ].map(([key, label, rows]) => (
                      <div key={key}>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {label}
                        </label>
                        <textarea
                          rows={rows}
                          value={builderForm[key]}
                          onChange={(event) =>
                            setBuilderForm((current) => ({ ...current, [key]: event.target.value }))
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleBuildResume}
                    disabled={builderLoading}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3.5 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles size={18} />
                    {builderLoading ? "Generating Resume..." : "Generate Resume"}
                  </button>
                </div>

                <aside className="space-y-6 xl:sticky xl:top-24 self-start">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Resume Maker Tips
                    </h2>
                    <div className="mt-5 space-y-4">
                      {[
                        "Paste achievements as bullet-friendly notes.",
                        "Mention tools, frameworks, and domain terms in skills.",
                        "Add metrics in experience and projects wherever possible.",
                        "Use the generated draft as a strong first version, then refine.",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <BadgeCheck className="mt-0.5 text-teal-600 dark:text-teal-400" size={18} />
                          <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          Template Gallery
                        </h2>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                          Choose a layout and preview it live on the right.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportPdf}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        <FileText size={16} />
                        Convert To PDF
                      </button>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {TEMPLATE_OPTIONS.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() =>
                            setBuilderForm((current) => ({
                              ...current,
                              templateStyle: template.id,
                            }))
                          }
                          className={`rounded-3xl border p-4 text-left transition ${
                            builderForm.templateStyle === template.id
                              ? "border-teal-500 bg-teal-50 shadow-md dark:border-teal-500 dark:bg-teal-900/20"
                              : "border-slate-200 bg-white hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-teal-700"
                          }`}
                        >
                          {renderTemplatePreviewCard(template.id)}
                          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {template.name}
                          </p>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {template.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {builtResume?.generationMode === "fallback" && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                        AI formatting response was incomplete, so Hirelytics generated a stable fallback draft using your selected template and form details.
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {builtResume ? "Generated Resume Preview" : "Live Template Preview"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {builtResume
                            ? "This preview uses the selected template and matches the downloadable resume."
                            : "Your selected layout updates here before generation."}
                        </p>
                      </div>
                      {builtResume && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setIsFullPreviewOpen(true)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                          >
                            <Maximize2 size={16} />
                            Full Screen Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportPdf(generatedPreviewRef.current)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                          >
                            <Download size={16} />
                            Download Resume
                          </button>
                        </div>
                      )}
                    </div>

                    <ResumeTemplatePreview
                      ref={builtResume ? generatedPreviewRef : previewRef}
                      data={builtResume ? generatedPreviewData : builderForm}
                      templateStyle={builtResume ? generatedTemplateStyle : builderForm.templateStyle}
                    />
                  </div>
                </aside>
              </div>

              {builtResume && (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Highlights</h3>
                      <div className="mt-4 space-y-3">
                        {builtResume.highlights.map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 text-teal-600 dark:text-teal-400" size={18} />
                            <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Draft Score</h3>
                      <p className={`mt-4 text-4xl font-bold ${scorePalette(builtResume.analysis.scores.overall)}`}>
                        {builtResume.analysis.scores.overall}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        ATS estimate: {builtResume.analysis.scores.ats} | Confidence: {builtResume.analysis.scores.confidence}
                      </p>
                    </section>
                  </div>

                  {!!builtResume.keywordStrategy?.length && (
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Keyword Strategy
                      </h3>
                      <div className="mt-4 space-y-3">
                        {builtResume.keywordStrategy.map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <Target className="mt-0.5 text-teal-600 dark:text-teal-400" size={18} />
                            <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {!!builtResume.sectionNotes?.length && (
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Section Notes
                      </h3>
                      <div className="mt-4 space-y-3">
                        {builtResume.sectionNotes.map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <BadgeCheck className="mt-0.5 text-teal-600 dark:text-teal-400" size={18} />
                            <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </section>
          )}

          <AppFooter />
        </div>
      </main>

      {isFullPreviewOpen && builtResume && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm md:p-8">
          <div className="w-full max-w-7xl rounded-[32px] border border-slate-200 bg-slate-50 p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-950 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Full Screen Resume Preview
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Previewing the generated resume in the selected {generatedTemplateStyle} template.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleExportPdf(generatedPreviewRef.current)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullPreviewOpen(false)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                  Close
                </button>
              </div>
            </div>

            <ResumeTemplatePreview
              ref={generatedPreviewRef}
              data={generatedPreviewData}
              templateStyle={generatedTemplateStyle}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeWorkbench;
