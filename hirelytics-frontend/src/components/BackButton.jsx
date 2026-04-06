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
      className={`inline-flex items-center justify-center gap-2 transition ${iconOnly ? "h-10 w-10 rounded-full text-current opacity-80 hover:bg-white/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 dark:hover:bg-white/10" : "rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur hover:-translate-x-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"} ${className}`.trim()}
      aria-label={label}
      title={label}
    >
      <ArrowLeft size={18} />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
};

export default BackButton;
