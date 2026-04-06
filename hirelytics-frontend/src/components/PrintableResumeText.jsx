const getPanelTheme = (templateStyle = "modern") => {
  const themes = {
    modern: "border-teal-200 bg-white",
    classic: "border-slate-300 bg-white",
    executive: "border-slate-800 bg-white",
    compact: "border-indigo-200 bg-white",
    ats_strict: "border-slate-300 bg-white",
  };

  return themes[templateStyle] || themes.modern;
};

export const PrintableResumeText = ({
  title,
  subtitle,
  content,
  templateStyle = "modern",
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-100 p-4 shadow-inner dark:border-slate-700 dark:bg-slate-950/40">
      <div
        className={`mx-auto w-full max-w-[860px] rounded-[28px] border p-8 shadow-2xl md:p-10 ${getPanelTheme(templateStyle)}`}
      >
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-2xl font-black tracking-tight text-slate-950">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          )}
        </div>
        <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-800">
          {content}
        </div>
      </div>
    </div>
  );
};

export default PrintableResumeText;
