export const BrandLogo = ({
  className = "",
  imgClassName = "",
  alt = "Hirelytics logo",
  priority = false,
}) => {
  return (
    <img
      src="/logo1.png"
      alt={alt}
      className={`object-contain ${imgClassName || className}`.trim()}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
};

export default BrandLogo;
