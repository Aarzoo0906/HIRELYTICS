import { forwardRef } from "react";
import { Mail, MapPin, Phone, Link as LinkIcon, Github } from "lucide-react";

const splitLines = (value = "") =>
  `${value}`
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

const splitSkills = (value = "") =>
  `${value}`
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const paragraphSections = new Set(["Summary", "Experience", "Internships", "Projects"]);

const sectionValueMap = (data) => ({
  Summary: data.summary,
  Experience: data.experience,
  Internships: data.internships,
  Projects: data.projects,
  Leadership: data.leadership,
  Education: data.education,
  Certifications: data.certifications,
  Achievements: data.achievements,
});

const createParagraphBlocks = (items = []) => {
  if (items.length <= 2) {
    return [items.join(" ")].filter(Boolean);
  }

  return [items.slice(0, 2).join(" "), items.slice(2, 4).join(" ")].filter(Boolean);
};

const getTemplateStyles = (templateStyle = "modern") => {
  const shared = {
    page: "mx-auto flex aspect-[210/297] w-full max-w-[860px] min-h-[1120px] flex-col bg-white text-slate-900 shadow-2xl",
    sectionTitle: "mb-2.5 text-[11px] font-bold uppercase tracking-[0.24em]",
    bullet: "mb-2 leading-relaxed",
  };

  const templates = {
    modern: {
      ...shared,
      pagePadding: "px-10 py-9 md:px-11 md:py-10",
      header: "rounded-[26px] bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 px-7 py-7 text-white",
      name: "text-4xl font-black tracking-tight text-white",
      role: "mt-2 text-lg font-semibold text-sky-100",
      accent: "text-sky-700",
      sectionBorder: "border-t border-slate-200 pt-4",
      skillChip: "rounded-full bg-sky-50 px-3 py-1 text-[12px] font-medium text-sky-800",
      sidebar: false,
      background: "bg-white",
    },
    classic: {
      ...shared,
      pagePadding: "px-11 py-10",
      header: "border-b-2 border-slate-900 pb-5",
      name: "text-[2.45rem] font-bold uppercase tracking-[0.16em] text-slate-950",
      role: "mt-2 text-base font-semibold text-slate-600",
      accent: "text-slate-800",
      sectionBorder: "border-t border-slate-300 pt-4",
      skillChip: "rounded-sm border border-slate-300 px-2.5 py-1 text-[12px] text-slate-800",
      sidebar: false,
      background: "bg-white",
    },
    executive: {
      ...shared,
      pagePadding: "px-10 py-9 md:px-11 md:py-10",
      header: "rounded-[30px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-8 py-8 text-white",
      name: "text-4xl font-black tracking-tight text-white",
      role: "mt-2 text-lg font-medium text-sky-100",
      accent: "text-slate-800",
      sectionBorder: "border-t border-slate-200 pt-4",
      skillChip: "rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-800",
      sidebar: false,
      background: "bg-white",
    },
    ats_strict: {
      ...shared,
      pagePadding: "px-10 py-9",
      header: "border-b border-slate-300 pb-4",
      name: "text-3xl font-bold text-slate-950",
      role: "mt-1 text-base font-semibold text-slate-700",
      accent: "text-slate-800",
      sectionBorder: "pt-4",
      skillChip: "rounded-none border border-slate-300 px-2 py-0.5 text-[12px] text-slate-800",
      sidebar: false,
      background: "bg-white",
    },
    compact: {
      ...shared,
      pagePadding: "px-8 py-8 md:px-10 md:py-9",
      header: "rounded-[24px] bg-gradient-to-r from-indigo-700 to-sky-600 px-6 py-6 text-white",
      name: "text-3xl font-black tracking-tight text-white",
      role: "mt-1 text-base font-semibold text-indigo-50",
      accent: "text-indigo-700",
      sectionBorder: "border-t border-slate-200 pt-4",
      skillChip: "rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-800",
      sidebar: true,
      background: "bg-white",
    },
  };

  return templates[templateStyle] || templates.modern;
};

export const ResumeTemplatePreview = forwardRef(function ResumeTemplatePreview(
  { data, templateStyle = "modern", exportId },
  ref,
) {
  const styles = getTemplateStyles(templateStyle);
  const skills = splitSkills(data.skills);
  const sectionEntries = [
    ["Summary", splitLines(data.summary)],
    ["Experience", splitLines(data.experience)],
    ["Internships", splitLines(data.internships)],
    ["Projects", splitLines(data.projects)],
    ["Leadership", splitLines(data.leadership)],
    ["Education", splitLines(data.education)],
    ["Certifications", splitLines(data.certifications)],
    ["Achievements", splitLines(data.achievements)],
  ].filter(([, items]) => items.length);
  const sections = Object.fromEntries(sectionEntries);
  const usesEditorialLayout = !styles.sidebar;
  const mainSectionOrder = ["Summary", "Experience", "Projects", "Internships"];
  const supportSectionOrder = ["Skills", "Education", "Certifications", "Achievements", "Leadership"];

  const renderSectionContent = (label, items) => {
    if (!items.length) return null;

    if (label === "Skills") {
      return (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span key={`${skill}-${index}`} className={styles.skillChip}>
              {skill}
            </span>
          ))}
        </div>
      );
    }

    if (paragraphSections.has(label)) {
      return createParagraphBlocks(items).map((paragraph, index) => (
        <p
          key={`${label}-paragraph-${index}`}
          className="text-[13px] leading-[1.72] text-slate-700"
        >
          {paragraph}
        </p>
      ));
    }

    return items.map((item, index) => (
      <p
        key={`${label}-line-${index}`}
        className="text-[13px] leading-[1.65] text-slate-700"
      >
        {item}
      </p>
    ));
  };

  const HeaderContent = (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className={styles.name}>{data.fullName || "Your Name"}</h1>
        <p className={styles.role}>
          {data.currentTitle || data.targetRole || "Target Role"}
          {data.yearsExperience ? ` | ${data.yearsExperience} years experience` : ""}
        </p>
        <div
          className={`mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[12.5px] ${
            templateStyle === "modern" ||
            templateStyle === "executive" ||
            templateStyle === "compact"
              ? "text-white/85"
              : "text-slate-600"
          }`}
        >
          {data.email && (
            <span className="inline-flex items-center gap-2">
              <Mail size={14} />
              {data.email}
            </span>
          )}
          {data.phone && (
            <span className="inline-flex items-center gap-2">
              <Phone size={14} />
              {data.phone}
            </span>
          )}
          {data.location && (
            <span className="inline-flex items-center gap-2">
              <MapPin size={14} />
              {data.location}
            </span>
          )}
          {data.linkedin && (
            <span className="inline-flex items-center gap-2">
              <LinkIcon size={14} />
              {data.linkedin}
            </span>
          )}
          {data.github && (
            <span className="inline-flex items-center gap-2">
              <Github size={14} />
              {data.github}
            </span>
          )}
        </div>
      </div>
      {data.profileImage ? (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-white/30 bg-white/10 shadow-xl">
          <img
            src={data.profileImage}
            alt={data.fullName || "Profile"}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-slate-100 p-4 shadow-inner dark:border-slate-700 dark:bg-slate-950/40">
      <div
        ref={ref}
        data-export-id={exportId}
        className={`${styles.page} ${styles.background} overflow-hidden rounded-[28px] ring-1 ring-slate-200/70`}
      >
        <div className={`${styles.pagePadding} flex h-full flex-1 flex-col`}>
          <header className={styles.header}>{HeaderContent}</header>

          {usesEditorialLayout ? (
            <div className="mt-6 grid flex-1 gap-7 md:grid-cols-[1.48fr_0.92fr]">
              <div className="space-y-5">
                {mainSectionOrder.map((label) => {
                  const items = sections[label] || [];
                  if (!items.length) return null;

                  return (
                    <section key={label} className={styles.sectionBorder}>
                      <h2 className={`${styles.sectionTitle} ${styles.accent}`}>{label}</h2>
                      <div className="space-y-2.5">{renderSectionContent(label, items)}</div>
                    </section>
                  );
                })}
              </div>

              <aside className="space-y-5">
                {supportSectionOrder.map((label) => {
                  const items =
                    label === "Skills" ? skills : splitLines(sectionValueMap(data)[label]);
                  if (!items.length) return null;

                  return (
                    <section key={label} className={styles.sectionBorder}>
                      <h2 className={`${styles.sectionTitle} ${styles.accent}`}>{label}</h2>
                      <div className="space-y-2.5">{renderSectionContent(label, items)}</div>
                    </section>
                  );
                })}
              </aside>
            </div>
          ) : (
            <div className="mt-6 grid flex-1 gap-8 md:grid-cols-[0.85fr_1.45fr]">
              <aside className="space-y-6">
                {skills.length > 0 && (
                  <section>
                    <h2 className={`${styles.sectionTitle} ${styles.accent}`}>Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <span key={`${skill}-${index}`} className={styles.skillChip}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
                {splitLines(data.education).length > 0 && (
                  <section>
                    <h2 className={`${styles.sectionTitle} ${styles.accent}`}>Education</h2>
                    <div className="space-y-2.5">
                      {renderSectionContent("Education", splitLines(data.education))}
                    </div>
                  </section>
                )}
                {splitLines(data.certifications).length > 0 && (
                  <section>
                    <h2 className={`${styles.sectionTitle} ${styles.accent}`}>Certifications</h2>
                    <div className="space-y-2.5">
                      {renderSectionContent("Certifications", splitLines(data.certifications))}
                    </div>
                  </section>
                )}
              </aside>

              <div className="space-y-5">
                {["Summary", "Experience", "Internships", "Projects", "Leadership", "Achievements"].map(
                  (label) => {
                    const items = splitLines(sectionValueMap(data)[label]);
                    if (!items.length) return null;

                    return (
                      <section key={label} className={styles.sectionBorder}>
                        <h2 className={`${styles.sectionTitle} ${styles.accent}`}>{label}</h2>
                        <div className="space-y-2.5">{renderSectionContent(label, items)}</div>
                      </section>
                    );
                  },
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ResumeTemplatePreview;
