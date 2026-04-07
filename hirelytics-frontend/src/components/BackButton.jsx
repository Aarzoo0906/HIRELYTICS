import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BackButton = ({
  fallbackTo = "/dashboard",
  label = "Back",
  className = "",
  iconOnly = false,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo, { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center justify-center gap-2 transition ${iconOnly ? "h-10 w-10 rounded-full border border-cyan-200/60 bg-white/80 text-current opacity-90 hover:bg-cyan-50 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15" : "rounded-xl border border-cyan-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur hover:-translate-x-0.5 hover:bg-cyan-50 dark:border-cyan-400/15 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-cyan-950/20"} ${className}`.trim()}
      aria-label={label}
      title={label}
    >
      <ArrowLeft size={18} />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
};

export default BackButton;
