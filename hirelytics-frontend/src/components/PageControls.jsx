import { ThemeToggle } from "./ThemeToggle";
import { BackButton } from "./BackButton";

export const PageControls = ({
  backFallbackTo = "/dashboard",
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`.trim()}>
      <BackButton fallbackTo={backFallbackTo} label="Back" iconOnly />
      <ThemeToggle iconOnly />
    </div>
  );
};

export default PageControls;
