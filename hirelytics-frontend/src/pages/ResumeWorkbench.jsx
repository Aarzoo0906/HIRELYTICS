import { useMemo, useRef, useState } from "react";
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

const splitResumeLines = (value = "") =>
  `${value}`
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

const IMPROVED_SECTION_LABELS = {
  summary: "summary",
  "professional summary": "summary",
  profile: "summary",
  skills: "skills",
  "technical skills": "skills",
  experience: "experience",
  "work experience": "experience",
  internships: "internships",
  projects: "projects",
  education: "education",
  certifications: "certifications",
  achievements: "achievements",
  leadership: "leadership",
  "positions of responsibility": "leadership",
  contact: "contact",
};

const parseImprovedResumeToStructuredData = (content = "", seed = {}) => {
  const structured = {
    fullName: seed.fullName || "",
    email: seed.email || "",
    phone: seed.phone || "",
    location: seed.location || "",
    linkedin: seed.linkedin || "",
    github: seed.github || "",
    profileImage: seed.profileImage || null,
    summary: "",
    skills: "",
    experience: "",
    internships: "",
    projects: "",
    education: "",
    certifications: "",
    achievements: "",
    leadership: "",
    currentTitle: seed.currentTitle || seed.targetRole || "",
    targetRole: seed.targetRole || "",
    yearsExperience: seed.yearsExperience || "",
  };

  const lines = `${content}`
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let activeSection = "summary";

  lines.forEach((line, index) => {
    const normalized = line.replace(/[:\-]+$/g, "").trim().toLowerCase();
    const mappedSection = IMPROVED_SECTION_LABELS[normalized];

    if (mappedSection) {
      activeSection = mappedSection;
      return;
    }

    if (!structured.fullName && index === 0 && line.length <= 40) {
      structured.fullName = line;
      return;
    }

    if (!structured.currentTitle && index <= 2 && line.length <= 70 && !line.includes("@")) {
      structured.currentTitle = line;
      return;
    }

    if (activeSection === "contact") {
      if (!structured.email && line.includes("@")) {
        structured.email = line;
        return;
      }

      if (!structured.linkedin && /linkedin/i.test(line)) {
        structured.linkedin = line;
        return;
      }

      if (!structured.github && /github/i.test(line)) {
        structured.github = line;
        return;
      }

      if (!structured.phone && /[+()\d][\d\s\-()]{7,}/.test(line)) {
        structured.phone = line;
        return;
      }
    }

    const nextValue = structured[activeSection];
    structured[activeSection] = nextValue
      ? `${nextValue}\n${line.replace(/^[-*•]\s*/, "")}`
      : line.replace(/^[-*•]\s*/, "");
  });

  return structured;
};

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
  const improvedPreviewRef = useRef(null);
  const [activeTab, setActiveTab] = useState("analyze");
  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analyzerProfileImage, setAnalyzerProfileImage] = useState("");
  const [improving, setImproving] = useState(false);
  const [improvedResume, setImprovedResume] = useState(null);
  const [builderLoading, setBuilderLoading] = useState(false);
  const [builtResume, setBuiltResume] = useState(null);
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
  const [isImprovedPreviewOpen, setIsImprovedPreviewOpen] = useState(false);
  const [downloadFallback, setDownloadFallback] = useState(null);
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
    profileImage: "",
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
    (builtResume
      ? generatedPreviewRef.current ||
        document.querySelector('[data-export-id="generated-resume-preview"]')
      : previewRef.current ||
        document.querySelector('[data-export-id="builder-resume-preview"]'));

  const getActiveImprovedPreviewElement = () =>
    improvedPreviewRef.current ||
    document.querySelector('[data-export-id="improved-resume-preview"]');

  const handleImageUpload = async (file, onComplete) => {
    if (!file) {
      onComplete("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      onComplete(imageDataUrl);
      setError("");
    } catch {
      setError("Unable to read the selected image.");
    }
  };

  const getActiveResumeData = () =>
    builtResume?.structuredResume || builderForm;

  const getResumeFileName = () =>
    `${(getActiveResumeData().fullName || "resume")
      .replace(/\s+/g, "-")
      .toLowerCase()}.pdf`;

  const getImprovedResumeFileName = () =>
    `${(builderForm.fullName || "improved-resume")
      .replace(/\s+/g, "-")
      .toLowerCase()}-improved.pdf`;

  const triggerPdfDownload = (pdf, fileName) => {
    try {
      const previousUrl = downloadFallback?.url;
      const pdfBlob = pdf.output("blob");
      const downloadUrl = URL.createObjectURL(pdfBlob);

      // Cleanup previous URL after new one is set
      if (previousUrl) {
        setTimeout(() => {
          try {
            URL.revokeObjectURL(previousUrl);
          } catch (e) {
            console.error("Error revoking object URL:", e);
          }
        }, 2000);
      }

      setDownloadFallback({
        url: downloadUrl,
        fileName,
      });

      // Create and trigger download
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = fileName;
      anchor.rel = "noopener noreferrer";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      
      // Trigger the download
      anchor.click();
      
      // Clean up
      document.body.removeChild(anchor);
    } catch (error) {
      console.error("Error triggering PDF download:", error);
      setError("Failed to download PDF. Please try again.");
    }
  };

  const cleanElementForExport = (element) => {
    // Create a deep clone to avoid modifying the original
    const clone = element.cloneNode(true);
    
    // Get all elements in the cloned tree
    const allElements = [clone, ...clone.querySelectorAll("*")];
    
    // Process each element to remove problematic styles
    allElements.forEach((el) => {
      try {
        const style = el.getAttribute("style") || "";
        
        // Remove any oklch color references from style
        let cleanedStyle = style
          .replace(/oklch\([^)]*\)/gi, "transparent")
          .replace(/color:\s*transparent/gi, "color: #000")
          .replace(/background-color:\s*transparent/gi, "background-color: #ffffff")
          .replace(/background:\s*transparent/gi, "background: #ffffff");
        
        if (cleanedStyle !== style) {
          el.setAttribute("style", cleanedStyle);
        }
        
        // Force set important colors on all elements
        try {
          const computedStyle = window.getComputedStyle(el);
          
          // Check computed backgroundColor
          if (computedStyle.backgroundColor) {
            const bgColor = computedStyle.backgroundColor;
            if (bgColor.includes("oklch") || bgColor === "transparent") {
              el.style.backgroundColor = "#ffffff";
            }
          }
          
          // Check computed color
          if (computedStyle.color) {
            const textColor = computedStyle.color;
            if (textColor.includes("oklch")) {
              el.style.color = "#000000";
            }
          }
          
          // Reset border colors that might have oklch
          if (computedStyle.borderColor && computedStyle.borderColor.includes("oklch")) {
            el.style.borderColor = "#e0e0e0";
          }
        } catch (e) {
          // Ignore errors in computed style access
        }
      } catch (err) {
        console.error("Error cleaning element:", err);
      }
    });
    
    return clone;
  };

  const exportElementAsPdf = async (targetElement, fileName) => {
    if (!targetElement) {
      setError("Preview is not ready yet. Please wait for the resume to load completely.");
      throw new Error("Preview element not found");
    }

    try {
      setError(""); // Clear previous errors
      
      // Ensure element is in the viewport
      const elementRect = targetElement.getBoundingClientRect();
      if (elementRect.width === 0 || elementRect.height === 0) {
        setError("Resume preview is not visible. Please ensure the preview is loaded.");
        throw new Error("Element has zero dimensions");
      }

      // Clone and clean element to avoid oklch color parsing issues
      const cleanElement = cleanElementForExport(targetElement);
      
      // Temporarily add to DOM for proper rendering
      cleanElement.style.position = "fixed";
      cleanElement.style.left = "-9999px";
      cleanElement.style.top = "-9999px";
      cleanElement.style.visibility = "hidden";
      cleanElement.style.zIndex = "-10000";
      document.body.appendChild(cleanElement);

      let canvas;
      try {
        // Convert to canvas with optimized settings
        canvas = await html2canvas(cleanElement, {
          scale: window.devicePixelRatio > 1.5 ? 1.5 : window.devicePixelRatio || 1,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          allowTaint: true,
          foreignObjectRendering: true,
        });
      } catch (canvasError) {
        console.error("Canvas conversion error:", canvasError);
        
        // If oklch error, try with more aggressive color stripping
        if (canvasError.message && canvasError.message.includes("oklch")) {
          console.log("Retrying with aggressive color stripping...");
          
          // Strip all background and text color classes
          const allEls = cleanElement.querySelectorAll("[class*='bg-'], [class*='text-'], [class*='border-']");
          allEls.forEach((el) => {
            const classes = el.className.split(" ");
            const filtered = classes.filter(
              (c) => !c.includes("bg-") && !c.includes("text-") && !c.includes("border-")
            );
            el.className = filtered.join(" ");
          });
          
          // Force all colors to be simple hex
          cleanElement.style.color = "#000000";
          cleanElement.style.backgroundColor = "#ffffff";
          
          canvas = await html2canvas(cleanElement, {
            scale: 1.2,
            backgroundColor: "#ffffff",
            useCORS: true,
            logging: false,
            allowTaint: true,
            foreignObjectRendering: false,
          });
        } else {
          throw canvasError;
        }
      }

      // Remove temporary clone
      document.body.removeChild(cleanElement);

      if (!canvas) {
        throw new Error("Failed to generate canvas from preview");
      }

      // Create PDF with proper sizing
      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgRatio = canvas.width / canvas.height;
      const pageRatio = pageWidth / pageHeight;
      
      let imgWidth, imgHeight;
      if (imgRatio > pageRatio) {
        imgWidth = pageWidth;
        imgHeight = pageWidth / imgRatio;
      } else {
        imgHeight = pageHeight;
        imgWidth = pageHeight * imgRatio;
      }
      
      const xOffset = (pageWidth - imgWidth) / 2;
      const yOffset = (pageHeight - imgHeight) / 2;

      pdf.addImage(
        imageData,
        "PNG",
        xOffset,
        yOffset,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );

      triggerPdfDownload(pdf, fileName);
    } catch (error) {
      console.error("PDF export error:", error);
      setError(`Failed to export resume: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  const exportPlainTextPdf = ({
    title = "Document",
    subtitle = "",
    content = "",
    fileName = "document.pdf",
  }) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = 18;

    const ensureSpace = (neededHeight = 8) => {
      if (cursorY + neededHeight <= pageHeight - 14) {
        return;
      }

      pdf.addPage();
      cursorY = 18;
    };

    const writeLines = (text, fontSize = 11, lineGap = 5.6, font = "normal") => {
      const lines = pdf.splitTextToSize(text, contentWidth);
      ensureSpace(lines.length * lineGap + 2);
      pdf.setFont("helvetica", font);
      pdf.setFontSize(fontSize);
      pdf.text(lines, margin, cursorY);
      cursorY += lines.length * lineGap;
    };

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(19);
    pdf.text(title, margin, cursorY);
    cursorY += 8;

    if (subtitle) {
      writeLines(subtitle, 10.5, 5.2);
      cursorY += 2;
    }

    pdf.setDrawColor(203, 213, 225);
    pdf.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 7;

    `${content || ""}`.split(/\r?\n/).forEach((line) => {
      if (!line.trim()) {
        cursorY += 3;
        ensureSpace(8);
        return;
      }

      writeLines(line, 10.5, 5.4);
      cursorY += 1;
    });

    triggerPdfDownload(pdf, fileName);
  };

  const exportResumeTextPdf = (resumeData) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = 18;

    const ensureSpace = (neededHeight = 8) => {
      if (cursorY + neededHeight <= pageHeight - 14) {
        return;
      }

      pdf.addPage();
      cursorY = 18;
    };

    const writeWrappedText = (text, fontSize = 11, lineGap = 5.5) => {
      const lines = pdf.splitTextToSize(text, contentWidth);
      ensureSpace(lines.length * lineGap + 2);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(fontSize);
      pdf.text(lines, margin, cursorY);
      cursorY += lines.length * lineGap;
    };

    const writeSection = (title, items = []) => {
      if (!items.length) {
        return;
      }

      ensureSpace(12);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text(title, margin, cursorY);
      cursorY += 4;
      pdf.setDrawColor(203, 213, 225);
      pdf.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 6;

      items.forEach((item) => {
        writeWrappedText(`- ${item}`, 10.5, 5.2);
        cursorY += 1;
      });

      cursorY += 2;
    };

    const headerLines = [
      resumeData.currentTitle || resumeData.targetRole || "",
      [resumeData.email, resumeData.phone, resumeData.location]
        .filter(Boolean)
        .join(" | "),
      [resumeData.linkedin, resumeData.github].filter(Boolean).join(" | "),
    ].filter(Boolean);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text(resumeData.fullName || "Your Name", margin, cursorY);
    cursorY += 9;

    headerLines.forEach((line, index) => {
      pdf.setFont("helvetica", index === 0 ? "bold" : "normal");
      pdf.setFontSize(index === 0 ? 11.5 : 10.5);
      writeWrappedText(line, index === 0 ? 11.5 : 10.5, 5);
      cursorY += 1;
    });

    cursorY += 4;

    writeSection("Professional Summary", splitResumeLines(resumeData.summary));
    writeSection("Skills", splitResumeLines(resumeData.skills.replace(/,/g, "\n")));
    writeSection("Experience", splitResumeLines(resumeData.experience));
    writeSection("Internships", splitResumeLines(resumeData.internships));
    writeSection("Projects", splitResumeLines(resumeData.projects));
    writeSection("Education", splitResumeLines(resumeData.education));
    writeSection("Certifications", splitResumeLines(resumeData.certifications));
    writeSection("Achievements", splitResumeLines(resumeData.achievements));
    writeSection("Leadership", splitResumeLines(resumeData.leadership));

    triggerPdfDownload(pdf, getResumeFileName());
  };

  const handleImprovedResumeDownload = async () => {
    if (!improvedResume?.improvedResume) {
      setError("Improved resume is not ready to download yet. Please complete the improvement process first.");
      return;
    }

    try {
      setError("");
      exportPlainTextPdf({
        title: improvedPreviewData.fullName || builderForm.fullName || "Improved Resume",
        subtitle:
          improvedPreviewData.currentTitle ||
          improvedPreviewData.targetRole ||
          targetRole ||
          "ATS-optimized resume",
        content: improvedResume.improvedResume,
        fileName: getImprovedResumeFileName(),
      });
    } catch (error) {
      console.error("Improved resume download failed:", error);
      setError("Failed to download improved resume PDF. Please try again.");
    }
  };

  const handleExportPdf = async () => {
    try {
      setError("");

      if (builtResume?.resumeText) {
        exportPlainTextPdf({
          title: builtResume.structuredResume?.fullName || builderForm.fullName || "Resume",
          subtitle:
            builtResume.structuredResume?.currentTitle ||
            builtResume.structuredResume?.targetRole ||
            builderForm.currentTitle ||
            builderForm.targetRole ||
            "ATS-ready resume",
          content: builtResume.resumeText,
          fileName: getResumeFileName(),
        });
        return;
      }

      exportResumeTextPdf(getActiveResumeData());
    } catch (error) {
      console.error("Resume download failed:", error);
      setError("Failed to download resume PDF. Please try again.");
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

  const generatedPreviewData = builtResume
    ? {
        ...builtResume.structuredResume,
        profileImage:
          builtResume.structuredResume?.profileImage || builderForm.profileImage,
      }
    : builderForm;
  const generatedTemplateStyle = builtResume?.templateStyle || builderForm.templateStyle;
  const improvedPreviewData = useMemo(
    () =>
      parseImprovedResumeToStructuredData(improvedResume?.improvedResume || "", {
        ...builderForm,
        profileImage: analyzerProfileImage || builderForm.profileImage || null,
      }),
    [analyzerProfileImage, builderForm, improvedResume?.improvedResume],
  );

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

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Profile Image (Optional)
                      </label>
                      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 transition hover:border-teal-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                        <span>
                          {analyzerProfileImage ? "Profile image added" : "Upload image for improved resume preview"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          Optional
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) =>
                            handleImageUpload(event.target.files?.[0], setAnalyzerProfileImage)
                          }
                        />
                      </label>
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
                    <div className="space-y-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsImprovedPreviewOpen(true)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                        >
                          <Maximize2 size={16} />
                          Full Screen Preview
                        </button>
                        <button
                          type="button"
                          onClick={handleImprovedResumeDownload}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                          <Download size={16} />
                          Download Improved Resume
                        </button>
                      </div>
                      <ResumeTemplatePreview
                        ref={improvedPreviewRef}
                        exportId="improved-resume-preview"
                        data={improvedPreviewData}
                        templateStyle={improveConfig.templateStyle}
                      />
                    </div>
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

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Profile Image (Optional)
                    </label>
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 transition hover:border-teal-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                      <span>
                        {builderForm.profileImage ? "Profile image added" : "Upload image for generated resume"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        Optional
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          handleImageUpload(event.target.files?.[0], (value) =>
                            setBuilderForm((current) => ({
                              ...current,
                              profileImage: value,
                            }))
                          )
                        }
                      />
                    </label>
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
                            onClick={() => handleExportPdf()}
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
                      exportId={builtResume ? "generated-resume-preview" : "builder-resume-preview"}
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
                  onClick={() => handleExportPdf()}
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
              exportId="generated-resume-preview"
              data={generatedPreviewData}
              templateStyle={generatedTemplateStyle}
            />
          </div>
        </div>
      )}

      {isImprovedPreviewOpen && improvedResume && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm md:p-8">
          <div className="w-full max-w-6xl rounded-[32px] border border-slate-200 bg-slate-50 p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-950 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Improved Resume Preview
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Full-screen view of the AI-improved resume draft.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleImprovedResumeDownload}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsImprovedPreviewOpen(false)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                  Close
                </button>
              </div>
            </div>

            <ResumeTemplatePreview
              ref={improvedPreviewRef}
              exportId="improved-resume-preview"
              data={improvedPreviewData}
              templateStyle={improveConfig.templateStyle}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeWorkbench;
