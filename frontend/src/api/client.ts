import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

const api = axios.create({
  baseURL,
});

function getApiOrigin(): string {
  if (/^https?:\/\//i.test(baseURL)) {
    return new URL(baseURL).origin;
  }

  return window.location.origin;
}

export function normalizeAssetUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.startsWith('data:') || normalizedValue.startsWith('blob:')) {
    return normalizedValue;
  }

  const apiOrigin = getApiOrigin();

  const toPublicUploadsPath = (pathValue: string): string => {
    if (pathValue.startsWith('/api/uploads/')) {
      return pathValue.replace('/api/uploads/', '/uploads/');
    }
    return pathValue;
  };

  if (/^https?:\/\//i.test(normalizedValue)) {
    const parsedUrl = new URL(normalizedValue);
    const normalizedPathname = toPublicUploadsPath(parsedUrl.pathname);

    if (normalizedPathname.startsWith('/uploads/')) {
      return new URL(`${normalizedPathname}${parsedUrl.search}${parsedUrl.hash}`, apiOrigin).toString();
    }

    return normalizedValue;
  }

  const assetPath = normalizedValue.startsWith('/') ? normalizedValue : `/${normalizedValue}`;
  const normalizedAssetPath = toPublicUploadsPath(assetPath);
  return new URL(normalizedAssetPath, apiOrigin).toString();
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('topix-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
