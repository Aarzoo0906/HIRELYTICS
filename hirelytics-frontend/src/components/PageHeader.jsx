import { PageControls } from "./PageControls";

export const PageHeader = ({
  eyebrow,
  title,
  description,
  icon: Icon,
  backFallbackTo = "/dashboard",
}) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-teal-300/70 bg-gradient-to-r from-teal-500/90 via-emerald-300/90 to-cyan-200/90 shadow-md transition-all duration-300 dark:border-teal-800/40 dark:from-slate-950 dark:via-teal-950 dark:to-emerald-950">
      <div className="px-4 py-6 md:px-6 md:py-7">
        <div className="flex min-h-[190px] flex-col gap-4 md:min-h-[206px] md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <PageControls
              backFallbackTo={backFallbackTo}
              className="text-slate-950 dark:text-white"
            />
            <div className="space-y-2">
              {eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700/80 dark:text-teal-200">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-3xl font-bold leading-tight text-slate-950 dark:text-white md:text-4xl">
                {title}
              </h1>
              {description && (
                <p className="max-w-2xl text-slate-800/85 dark:text-white/80">
                  {description}
                </p>
              )}
            </div>
          </div>

          {Icon && (
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-950/10 bg-white/25 text-slate-950 shadow-sm backdrop-blur-sm dark:border-white/20 dark:bg-white/10 dark:text-white md:inline-flex">
              <Icon size={28} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageHeader;
