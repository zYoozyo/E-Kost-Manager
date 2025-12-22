import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, User, Lock, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginFormData } from '../types';
import toast from 'react-hot-toast';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<LoginFormData>();

  // Auto-fill email dari location state (setelah accept invitation)
  useEffect(() => {
    const state = location.state as { email?: string; message?: string } | null;
    if (state?.email) {
      setValue('email', state.email);
      if (state.message) {
        toast.success(state.message, {
          duration: 5000,
        });
      }
    }
  }, [location.state, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      // 1. Log Attempt (Logging)
      console.log('Login Attempt:', {
        email: data.email,
        timestamp: new Date().toISOString(),
      });

      // Clear previous error status saat mulai login baru
      setLoginStatus({ type: null, message: '' });
      
      // 2. Call non-refresh login service (Auth Logic)
      const loggedInUser = await login(data.email, data.password);
      
      // 3. Log Success (Logging)
      console.log('Login Success:', {
        email: data.email,
        role: loggedInUser.role,
        timestamp: new Date().toISOString(),
      });

      // 4. Show Success Message dengan Toast
      toast.success('Login berhasil! Mengalihkan...', {
        duration: 2000,
        position: 'top-center',
      });
      
      setLoginStatus({
        type: 'success',
        message: 'Login berhasil! Mengalihkan...',
      });

      // 5. Navigate (Non-refresh redirect)
      setTimeout(() => {
        console.log('LoginForm: Navigating based on role:', loggedInUser.role);
        if (loggedInUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/tenant');
        }
      }, 1000);

    } catch (error: any) {
      // 6. Log Error (Logging)
      const errorDetails = {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };
      console.error('❌ Login Failed:', errorDetails);

      // 7. Show Error Message dengan Toast Notification
      let errorMessage = 'Login gagal. Silakan coba lagi.';
      
      if (error.response?.status === 401) {
        // Email atau password salah
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = 'Email atau password salah. Silakan periksa kembali.';
        }
      } else if (error.response?.status === 422) {
        // Validation error
        errorMessage = error.response?.data?.message || 'Data yang dimasukkan tidak valid.';
      } else if (error.response?.status === 500) {
        // Extract error message from server response
        const serverMessage = error.response?.data?.message || '';
        if (serverMessage.includes('SQLSTATE') || serverMessage.includes('database')) {
          errorMessage = 'Terjadi kesalahan pada database. Silakan hubungi administrator.';
        } else {
          errorMessage = serverMessage || 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
        }
      } else if (error.message === 'Network Error' || !error.response) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }
      
      // Show toast notification dengan durasi lebih lama agar user sempat membaca
      toast.error(errorMessage, {
        duration: 6000,
        position: 'top-center',
        style: {
          background: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fecaca',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '400px',
        },
      });
      
      // Set error status di form - PASTIKAN selalu ditampilkan
      setLoginStatus({
        type: 'error',
        message: errorMessage,
      });
      
      // JANGAN reset form - biarkan user melihat input mereka dan memperbaiki
      // JANGAN navigate - tetap di halaman login
    }
  };

  return (
    <div className="w-full max-w-md mx-auto" data-aos="fade-up">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 md:p-8">
        <div className="text-center mb-5 sm:mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary-100 rounded-full mb-3 sm:mb-4">
            <Building2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-600" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Selamat Datang</h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Masuk ke akun Anda</p>
        </div>

        {/* Status Message - Selalu tampilkan jika ada error */}
        {loginStatus.type && (
          <div
            className={`mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              loginStatus.type === 'success'
                ? 'bg-green-50 border-2 border-green-300'
                : 'bg-red-50 border-2 border-red-300'
            }`}
            role="alert"
            aria-live="assertive"
          >
            {loginStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm sm:text-base font-semibold ${
                  loginStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {loginStatus.message}
              </p>
              {loginStatus.type === 'error' && (
                <p className="text-xs sm:text-sm text-red-600 mt-1">
                  Silakan periksa email dan password Anda, lalu coba lagi.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <p className="text-xs sm:text-sm text-gray-500">
            Role akun Anda (Pemilik/Penyewa) akan ditentukan otomatis berdasarkan data di sistem.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 md:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                {...register('email', { required: 'Email wajib diisi' })}
                className={`w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-3.5 pl-11 sm:pl-12 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-black text-sm sm:text-base min-h-[44px] sm:min-h-[48px] ${
                  loginStatus.type === 'error' ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan email Anda"
                disabled={isLoading}
                autoComplete="email"
                onChange={(e) => {
                  // Clear error saat user mulai mengetik (opsional)
                  // Biarkan error tetap terlihat agar user tahu apa yang salah
                }}
              />
              <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
            {errors.email && (
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1.5 sm:gap-2">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password wajib diisi' })}
                className={`w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-3.5 pl-11 sm:pl-12 pr-11 sm:pr-12 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-black text-sm sm:text-base min-h-[44px] sm:min-h-[48px] ${
                  loginStatus.type === 'error' ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan password Anda"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1.5 sm:gap-2">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{errors.password.message}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-2.5 sm:py-3 md:py-3.5 px-4 sm:px-5 rounded-lg sm:rounded-xl font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[52px] md:min-h-[56px] text-sm sm:text-base touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <div className="mt-4 sm:mt-5 md:mt-6 space-y-2 sm:space-y-3 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            <button
              onClick={() => navigate('/auth/forgot-password')}
              className="text-primary-600 hover:text-primary-700 font-medium touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              disabled={isLoading}
            >
              Lupa password?
            </button>
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            Belum punya akun?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-primary-600 hover:text-primary-700 font-medium touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              disabled={isLoading}
            >
              Daftar sebagai pemilik
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};