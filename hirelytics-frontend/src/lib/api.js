const getRenderApiFallback = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const hostname = window.location.hostname.toLowerCase();

  if (hostname === "hirelytics-frontend-01.onrender.com") {
    return "https://hirelytics-backend.onrender.com/api";
  }

  return "";
};

export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  getRenderApiFallback() ||
  "http://localhost:5000/api";

export const parseApiResponse = async (response) => {
  const raw = await response.text();
  let data = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      if (/^\s*</.test(raw)) {
        throw new Error(
          "API returned HTML instead of JSON. Check VITE_API_URL and Render environment settings.",
        );
      }

      throw new Error(`Invalid API response: ${raw.slice(0, 160)}`);
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
};
