import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://api.ekostmanager.com/api';

// Debug: Log API URL yang digunakan (hanya di development)
if (import.meta.env.DEV) {
  console.log('🔧 API Base URL:', API_BASE_URL);
  console.log('🔧 VITE_API_URL from env:', import.meta.env.VITE_API_URL);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // 🔥 WAJIB (cookie + session)
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config: any) => {
    const token = sessionStorage.getItem('token');

    // Jangan kirim token untuk auth publik (OTP, register, login)
    const publicAuthEndpoints = [
      '/auth/register',
      '/auth/login',
      '/auth/otp',
    ];

    const isPublicAuth = publicAuthEndpoints.some((url) =>
      config.url?.includes(url)
    );

    if (token && !isPublicAuth) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData: biarkan browser set Content-Type
    if (config.data instanceof FormData) {
      delete config.headers?.['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jangan redirect untuk endpoint login/register karena itu adalah error yang diharapkan
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/auth/register') ||
                           error.config?.url?.includes('/auth/forgot-password') ||
                           error.config?.url?.includes('/auth/reset-password');
    
    // Hanya redirect jika 401 terjadi pada endpoint yang memerlukan autentikasi
    // dan bukan dari proses login/register
    if (error.response?.status === 401 && !isAuthEndpoint) {
      const currentPath = window.location.pathname;
      // Jangan redirect jika sudah di halaman login
      if (currentPath !== '/auth/login' && currentPath !== '/') {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);