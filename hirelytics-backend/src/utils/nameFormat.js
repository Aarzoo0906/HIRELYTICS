export const formatDisplayName = (value = "") =>
  `${value}`
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

