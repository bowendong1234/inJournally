const rawApiBaseUrl = import.meta.env.VITE_API_URL;

const getApiBaseUrl = () => {
  if (rawApiBaseUrl && rawApiBaseUrl.trim()) {
    return rawApiBaseUrl.replace(/\/$/, '');
  }

  // Default for Firebase Functions deployments where the Express app is exported as `backendApi`.
  return '/backendApi';
};

const API_BASE_URL = getApiBaseUrl();

export const buildApiUrl = (path) => {
  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalisedPath}`;
};

export { API_BASE_URL };
