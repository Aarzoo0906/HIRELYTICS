import { PageControls } from "./PageControls";

export const PageHeader = ({
  eyebrow,
  title,
  description,
  icon: Icon,
  backFallbackTo = "/dashboard",
}) => {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-cyan-300/30 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.35),transparent_22%),radial-gradient(circle_at_80%_18%,rgba(56,189,248,0.32),transparent_20%),linear-gradient(135deg,#020617_0%,#082f49_20%,#0f3f7d_48%,#1d4ed8_72%,#22d3ee_100%)] shadow-[0_36px_100px_-40px_rgba(14,165,233,0.55)] transition-all duration-300">
      <div className="px-4 py-6 md:px-6 md:py-7">
        <div className="flex min-h-[190px] flex-col gap-4 md:min-h-[206px] md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <PageControls
              backFallbackTo={backFallbackTo}
              className="text-white"
            />
            <div className="space-y-2">
              {eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
                {title}
              </h1>
              {description && (
                <p className="max-w-2xl text-cyan-50/84">
                  {description}
                </p>
              )}
            </div>
          </div>

          {Icon && (
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-slate-950/20 text-white shadow-sm backdrop-blur-sm md:inline-flex">
              <Icon size={28} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageHeader;
