import { forwardRef } from "react";

const KNOWN_HEADINGS = new Set([
  "summary",
  "professional summary",
  "profile",
  "experience",
  "work experience",
  "internships",
  "projects",
  "education",
  "skills",
  "technical skills",
  "certifications",
  "achievements",
  "leadership",
  "positions of responsibility",
  "contact",
]);

const normalizeHeading = (value = "") =>
  `${value}`.replace(/[:\-]+$/g, "").trim().toLowerCase();

const parseSections = (content = "") => {
  const lines = `${content}`.split("\n");
  const sections = [];
  let currentSection = null;

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      return;
    }

    const normalized = normalizeHeading(line);
    const isHeading =
      KNOWN_HEADINGS.has(normalized) ||
      (/^[A-Z\s&/]{3,}$/.test(line) && line.length <= 40) ||
      (/^[A-Z][A-Za-z\s&/]+:$/.test(line) && line.length <= 42);

    if (isHeading) {
      currentSection = {
        title: line.replace(/[:\-]+$/g, ""),
        items: [],
      };
      sections.push(currentSection);
      return;
    }

    if (!currentSection) {
      currentSection = {
        title: "Professional Summary",
        items: [],
      };
      sections.push(currentSection);
    }

    currentSection.items.push(line.replace(/^[-*•]\s*/, ""));
  });

  return sections;
};

const getPanelTheme = (templateStyle = "modern") => {
  const themes = {
    modern: {
      shell: "border-cyan-200 bg-white",
      sheet:
        "border-cyan-200 bg-[linear-gradient(180deg,#ffffff_0%,#f4fbff_100%)]",
      hero:
        "bg-[linear-gradient(135deg,#082f49_0%,#0f3f7d_52%,#22d3ee_100%)] text-white",
      accent: "text-cyan-700",
      chip: "bg-cyan-50 text-cyan-700 border-cyan-100",
    },
    classic: {
      shell: "border-slate-300 bg-white",
      sheet: "border-slate-300 bg-white",
      hero: "bg-white text-slate-950 border-b-2 border-slate-300",
      accent: "text-slate-700",
      chip: "bg-slate-100 text-slate-700 border-slate-200",
    },
    executive: {
      shell: "border-slate-800 bg-white",
      sheet:
        "border-slate-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]",
      hero:
        "bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_58%,#0f766e_100%)] text-white",
      accent: "text-amber-700",
      chip: "bg-amber-50 text-amber-700 border-amber-100",
    },
    compact: {
      shell: "border-indigo-200 bg-white",
      sheet:
        "border-indigo-200 bg-[linear-gradient(180deg,#ffffff_0%,#f6f7ff_100%)]",
      hero:
        "bg-[linear-gradient(135deg,#3730a3_0%,#2563eb_60%,#38bdf8_100%)] text-white",
      accent: "text-indigo-700",
      chip: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    ats_strict: {
      shell: "border-slate-300 bg-white",
      sheet: "border-slate-300 bg-white",
      hero: "bg-white text-slate-950 border-b border-slate-300",
      accent: "text-slate-800",
      chip: "bg-slate-100 text-slate-700 border-slate-200",
    },
  };

  return themes[templateStyle] || themes.modern;
};

export const PrintableResumeText = forwardRef(function PrintableResumeText({
  title,
  subtitle,
  content,
  templateStyle = "modern",
  image,
}, ref) {
  const theme = getPanelTheme(templateStyle);
  const sections = parseSections(content);
  const heroTextClass =
    templateStyle === "classic" || templateStyle === "ats_strict"
      ? "text-slate-950"
      : "text-white";
  const metaTextClass =
    templateStyle === "classic" || templateStyle === "ats_strict"
      ? "text-slate-600"
      : "text-white/82";

  return (
    <div
      ref={ref}
      className="rounded-3xl border border-slate-200 bg-slate-100 p-4 shadow-inner dark:border-slate-700 dark:bg-slate-950/40"
    >
      <div
        className={`mx-auto w-full max-w-[860px] rounded-[28px] border shadow-2xl ${theme.sheet}`}
      >
        <div className="p-6 md:p-8">
          <div className={`rounded-[24px] px-6 py-6 md:px-7 ${theme.hero}`}>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${metaTextClass}`}>
                  {title}
                </p>
                {subtitle && (
                  <p className={`mt-2 max-w-2xl text-sm leading-6 ${metaTextClass}`}>
                    {subtitle}
                  </p>
                )}
              </div>
              {image ? (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-white/30 bg-white/10 shadow-xl">
                  <img
                    src={image}
                    alt="Resume profile"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {sections.map((section, index) => (
              <section
                key={`${section.title}-${index}`}
                className={`${index > 0 ? "border-t border-slate-200 pt-5" : ""}`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className={`inline-flex h-2.5 w-2.5 rounded-full ${templateStyle === "classic" || templateStyle === "ats_strict" ? "bg-slate-500" : templateStyle === "compact" ? "bg-indigo-500" : templateStyle === "executive" ? "bg-amber-500" : "bg-cyan-500"}`} />
                  <h3 className={`text-sm font-black uppercase tracking-[0.24em] ${theme.accent}`}>
                    {section.title}
                  </h3>
                </div>

                {section.items.length > 1 ? (
                  <div className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={`${section.title}-${itemIndex}`}
                        className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm"
                      >
                        <p className="text-sm leading-7 text-slate-800">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-slate-800">
                    {section.items[0]}
                  </p>
                )}
              </section>
            ))}
          </div>

          {!sections.length ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
              Improved resume content will appear here.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});

export default PrintableResumeText;
