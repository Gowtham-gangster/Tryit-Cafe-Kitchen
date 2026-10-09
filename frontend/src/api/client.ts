import axios from 'axios';

export const validateApiBaseUrl = (url: string | undefined, isProd: boolean, hostname = 'tryitcafe.com'): string => {
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  if (isProd && !isLocalhost) {
    if (!url || !url.trim()) {
      throw new Error("CRITICAL SECURITY CONFIGURATION ERROR: 'VITE_API_BASE_URL' is missing in production. An HTTPS API URL is required.");
    }
    const trimmed = url.trim();
    if (!trimmed.startsWith('https://')) {
      throw new Error(`CRITICAL SECURITY ERROR: Insecure API Base URL '${trimmed}'. Production API base URL must use HTTPS.`);
    }
    return trimmed;
  }

  if (isProd && url && !url.startsWith('https://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    throw new Error(`CRITICAL SECURITY ERROR: Insecure API Base URL '${url}'. Production API base URL must use HTTPS.`);
  }

  if (url) {
    if (hostname && !isLocalhost) {
      if (typeof window !== 'undefined' && (window.location.protocol === 'https:' || !url.startsWith('https://'))) {
        return '/api/v1';
      }
      return url.replace('localhost', hostname).replace('127.0.0.1', hostname);
    }
    return url;
  }

  return '/api/v1';
};

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  const isProd = import.meta.env.PROD;
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return validateApiBaseUrl(envUrl, isProd, hostname);
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if available
apiClient.interceptors.request.use((config) => {
  const isOwnerScope = 
    config.url?.includes('/owner') || 
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/owner'));
  
  // Prefer dedicated owner token for owner requests, fallback to general auth token
  const token = isOwnerScope
    ? (localStorage.getItem('tryit_owner_token') || localStorage.getItem('tryit_auth_token'))
    : localStorage.getItem('tryit_auth_token');

  if (token && config.headers) {
    if (typeof (config.headers as any).set === 'function') {
      (config.headers as any).set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: Extract data and handle 401 & 403
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const isOwnerPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner');
      const isOwnerRequest = error.config?.url?.includes('/owner');
      
      // If 401 or 403 on an owner endpoint/page, clear stale owner credentials and redirect to owner login
      if ((isOwnerPath || isOwnerRequest) && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('tryit_owner_token');
        localStorage.removeItem('tryit_owner_user');
        window.location.href = '/owner/login';
      } else if (!isOwnerPath && !isOwnerRequest) {
        // Customer 401: clear expired token so subsequent requests do not send bad credentials
        localStorage.removeItem('tryit_auth_token');
        localStorage.removeItem('tryit_user');
      }
    }
    return Promise.reject(error);
  }
);

