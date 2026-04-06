export const getValidImageSrc = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (
    !normalized ||
    normalized === "null" ||
    normalized === "undefined"
  ) {
    return null;
  }

  return normalized;
};
