import { API_URL } from '../config';

// Token Management (only access token in memory/localStorage)
export const getAccessToken = () => localStorage.getItem('accessToken');

export const setAccessToken = (accessToken) => {
  localStorage.setItem('accessToken', accessToken);
};

export const clearAuth = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

// Token Refresh Handler
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

const refreshAccessToken = async () => {
  // Refresh token is sent automatically via HTTP-only cookie
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include' // Important: sends cookies
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  setAccessToken(data.accessToken);
  return data.accessToken;
};

// API Fetch with Auto Refresh
export const apiFetch = async (endpoint, options = {}) => {
  const accessToken = getAccessToken();

  const config = {
    ...options,
    credentials: 'include', // Always include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, config);

  // Handle token expiration
  if (response.status === 401) {
    const errorData = await response.clone().json();

    if (errorData.code === 'TOKEN_EXPIRED') {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newAccessToken = await refreshAccessToken();
          isRefreshing = false;
          onTokenRefreshed(newAccessToken);

          // Retry original request
          config.headers['Authorization'] = `Bearer ${newAccessToken}`;
          response = await fetch(`${API_URL}${endpoint}`, config);
        } catch (error) {
          isRefreshing = false;
          clearAuth();
          window.location.href = '/';
          throw error;
        }
      } else {
        // Wait for ongoing refresh
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(async (newAccessToken) => {
            try {
              config.headers['Authorization'] = `Bearer ${newAccessToken}`;
              const retryResponse = await fetch(`${API_URL}${endpoint}`, config);
              resolve(retryResponse);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    } else {
      clearAuth();
      window.location.href = '/';
    }
  }

  return response;
};

// Logout
export const logout = async () => {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    // Ignore errors
  } finally {
    clearAuth();
    window.location.href = '/';
  }
};
