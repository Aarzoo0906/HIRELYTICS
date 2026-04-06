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

const getTemplateStyles = (templateStyle = "modern") => {
  const shared = {
    page: "mx-auto w-full max-w-[860px] bg-white text-slate-900 shadow-2xl",
    sectionTitle: "mb-3 text-xs font-bold uppercase tracking-[0.24em]",
    bullet: "mb-2 leading-relaxed",
  };

  const templates = {
    modern: {
      ...shared,
      pagePadding: "p-10 md:p-12",
      header: "rounded-[26px] bg-gradient-to-r from-slate-950 via-teal-950 to-emerald-900 px-7 py-7 text-white",
      name: "text-4xl font-black tracking-tight text-white",
      role: "mt-2 text-lg font-semibold text-teal-100",
      accent: "text-teal-700",
      sectionBorder: "border-t border-slate-200 pt-5",
      skillChip: "rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800",
      sidebar: false,
      background: "bg-white",
    },
    classic: {
      ...shared,
      pagePadding: "p-12",
      header: "border-b-2 border-slate-900 pb-5",
      name: "text-[2.55rem] font-bold uppercase tracking-[0.16em] text-slate-950",
      role: "mt-2 text-base font-semibold text-slate-600",
      accent: "text-slate-800",
      sectionBorder: "border-t border-slate-300 pt-4",
      skillChip: "rounded-sm border border-slate-300 px-2.5 py-1 text-sm text-slate-800",
      sidebar: false,
      background: "bg-white",
    },
    executive: {
      ...shared,
      pagePadding: "p-10 md:p-12",
      header: "rounded-[30px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-8 py-8 text-white",
      name: "text-4xl font-black tracking-tight text-white",
      role: "mt-2 text-lg font-medium text-amber-100",
      accent: "text-amber-600",
      sectionBorder: "border-t border-slate-200 pt-5",
      skillChip: "rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800",
      sidebar: false,
      background: "bg-white",
    },
    ats_strict: {
      ...shared,
      pagePadding: "p-10",
      header: "border-b border-slate-300 pb-4",
      name: "text-3xl font-bold text-slate-950",
      role: "mt-1 text-base font-semibold text-slate-700",
      accent: "text-slate-800",
      sectionBorder: "pt-4",
      skillChip: "rounded-none border border-slate-300 px-2 py-0.5 text-sm text-slate-800",
      sidebar: false,
      background: "bg-white",
    },
    compact: {
      ...shared,
      pagePadding: "p-8 md:p-10",
      header: "rounded-[24px] bg-gradient-to-r from-indigo-700 to-sky-600 px-6 py-6 text-white",
      name: "text-3xl font-black tracking-tight text-white",
      role: "mt-1 text-base font-semibold text-indigo-50",
      accent: "text-indigo-700",
      sectionBorder: "border-t border-slate-200 pt-4",
      skillChip: "rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-800",
      sidebar: true,
      background: "bg-white",
    },
  };

  return templates[templateStyle] || templates.modern;
};

export const ResumeTemplatePreview = forwardRef(function ResumeTemplatePreview(
  { data, templateStyle = "modern" },
  ref,
) {
  const styles = getTemplateStyles(templateStyle);
  const skills = splitSkills(data.skills);
  const sections = [
    ["Summary", splitLines(data.summary)],
    ["Experience", splitLines(data.experience)],
    ["Internships", splitLines(data.internships)],
    ["Projects", splitLines(data.projects)],
    ["Leadership", splitLines(data.leadership)],
    ["Education", splitLines(data.education)],
    ["Certifications", splitLines(data.certifications)],
    ["Achievements", splitLines(data.achievements)],
  ].filter(([, items]) => items.length);

  const HeaderContent = (
    <>
      <div>
        <h1 className={styles.name}>{data.fullName || "Your Name"}</h1>
        <p className={styles.role}>
          {data.currentTitle || data.targetRole || "Target Role"}{data.yearsExperience ? ` | ${data.yearsExperience} years experience` : ""}
        </p>
      </div>
      <div className={`mt-4 flex flex-wrap gap-3 text-sm ${templateStyle === "modern" || templateStyle === "executive" || templateStyle === "compact" ? "text-white/85" : "text-slate-600"}`}>
        {data.email && (
          <span className="inline-flex items-center gap-2"><Mail size={14} />{data.email}</span>
        )}
        {data.phone && (
          <span className="inline-flex items-center gap-2"><Phone size={14} />{data.phone}</span>
        )}
        {data.location && (
          <span className="inline-flex items-center gap-2"><MapPin size={14} />{data.location}</span>
        )}
        {data.linkedin && (
          <span className="inline-flex items-center gap-2"><LinkIcon size={14} />{data.linkedin}</span>
        )}
        {data.github && (
          <span className="inline-flex items-center gap-2"><Github size={14} />{data.github}</span>
        )}
      </div>
    </>
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-slate-100 p-4 shadow-inner dark:border-slate-700 dark:bg-slate-950/40">
      <div
        ref={ref}
        className={`${styles.page} ${styles.background} overflow-hidden rounded-[28px] ring-1 ring-slate-200/70`}
      >
        <div className={styles.pagePadding}>
          <header className={styles.header}>{HeaderContent}</header>

          {styles.sidebar ? (
            <div className="mt-6 grid gap-8 md:grid-cols-[0.85fr_1.45fr]">
              <aside className="space-y-6">
                {skills.length > 0 && (
                  <section>
                    <h2 className={`${styles.sectionTitle} ${styles.accent}`}>Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className={styles.skillChip}>{skill}</span>
                      ))}
                    </div>
                  </section>
                )}
                {splitLines(data.education).length > 0 && (
                  <section>
                    <h2 className={`${styles.sectionTitle} ${styles.accent}`}>Education</h2>
                    {splitLines(data.education).map((item) => (
                      <p key={item} className="mb-2 text-sm leading-relaxed">{item}</p>
                    ))}
                  </section>
                )}
                {splitLines(data.certifications).length > 0 && (
                  <section>
                    <h2 className={`${styles.sectionTitle} ${styles.accent}`}>Certifications</h2>
                    {splitLines(data.certifications).map((item) => (
                      <p key={item} className="mb-2 text-sm leading-relaxed">{item}</p>
                    ))}
                  </section>
                )}
              </aside>

              <div className="space-y-6">
                {splitLines(data.summary).length > 0 && (
                  <section className={styles.sectionBorder}>
                    <h2 className={`${styles.sectionTitle} ${styles.accent}`}>Summary</h2>
                    {splitLines(data.summary).map((item) => (
                      <p key={item} className="mb-2 text-sm leading-relaxed">{item}</p>
                    ))}
                  </section>
                )}
                {["Experience", "Internships", "Projects", "Leadership", "Achievements"].map((label) => {
                  const mapping = {
                    Experience: data.experience,
                    Internships: data.internships,
                    Projects: data.projects,
                    Leadership: data.leadership,
                    Achievements: data.achievements,
                  };
                  const items = splitLines(mapping[label]);
                  if (!items.length) return null;
                  return (
                    <section key={label} className={styles.sectionBorder}>
                      <h2 className={`${styles.sectionTitle} ${styles.accent}`}>{label}</h2>
                      <ul className="list-disc pl-5 text-sm">
                        {items.map((item) => (
                          <li key={item} className={styles.bullet}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {skills.length > 0 && (
                <section className={styles.sectionBorder}>
                  <h2 className={`${styles.sectionTitle} ${styles.accent}`}>Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill} className={styles.skillChip}>{skill}</span>
                    ))}
                  </div>
                </section>
              )}

              {sections.map(([label, items]) => (
                <section key={label} className={styles.sectionBorder}>
                  <h2 className={`${styles.sectionTitle} ${styles.accent}`}>{label}</h2>
                  {label === "Summary" ? (
                    items.map((item) => (
                      <p key={item} className="mb-2 text-sm leading-relaxed">{item}</p>
                    ))
                  ) : (
                    <ul className="list-disc pl-5 text-sm">
                      {items.map((item) => (
                        <li key={item} className={styles.bullet}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ResumeTemplatePreview;
