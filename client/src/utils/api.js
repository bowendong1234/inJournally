// Base URL for the backendApi onRequest function (no longer used for OAuth).
// Kept for any future HTTP functions that go through a single Express-style wrapper.
const rawApiBaseUrl = import.meta.env.VITE_API_URL;

const getApiBaseUrl = () => {
  if (rawApiBaseUrl && rawApiBaseUrl.trim()) {
    return rawApiBaseUrl.replace(/\/$/, '');
  }
  return '/backendApi';
};

export const API_BASE_URL = getApiBaseUrl();

export const buildApiUrl = (path) => {
  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalisedPath}`;
};

// Base URL for standalone Firebase onRequest functions (spotifyAuthorise, spotifyCallback).
// When blank, relative paths are used — works with Firebase Hosting rewrites.
const rawFunctionsBaseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL;

const FUNCTIONS_BASE_URL = rawFunctionsBaseUrl
  ? rawFunctionsBaseUrl.replace(/\/$/, '')
  : '';

export const buildFunctionUrl = (functionName) => `${FUNCTIONS_BASE_URL}/${functionName}`;
