const getRenderApiFallback = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const hostname = window.location.hostname.toLowerCase();

  if (hostname === "hirelytics-frontend-01.onrender.com") {
    return "https://hirelytics-backend-1.onrender.com/api";
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

export const fetchJson = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return await parseApiResponse(response);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};
