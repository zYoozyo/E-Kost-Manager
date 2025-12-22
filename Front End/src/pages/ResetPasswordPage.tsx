import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { ResetPasswordResponse } from '../types';
import toast from 'react-hot-toast';

interface ResetPasswordFormData {
  email: string;
  otp: string;
  password: string;
  passwordConfirmation: string;
}

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  const emailFromQuery = searchParams.get('email') || '';
  const otpFromQuery = searchParams.get('otp') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      email: emailFromQuery,
      otp: otpFromQuery,
    },
  });

  useEffect(() => {
    if (emailFromQuery) {
      setValue('email', emailFromQuery);
    }
    if (otpFromQuery) {
      setValue('otp', otpFromQuery);
    }
  }, [emailFromQuery, otpFromQuery, setValue]);

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      const response = await authService.resetPassword(
        data.email,
        data.otp,
        data.password,
        data.passwordConfirmation
      );
      const typedResponse = response as ResetPasswordResponse;
      
      if (typedResponse.success) {
        setPasswordReset(true);
        toast.success('Password berhasil direset!');
        
        // Redirect ke login setelah 2 detik
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } else {
        toast.error(typedResponse.message || 'Gagal mereset password');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      let errorMessage = 'Gagal mereset password. Silakan coba lagi.';
      
      if (error.response?.status === 422) {
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          Object.entries(errors).forEach(([field, messages]) => {
            const msgArray = messages as string[];
            msgArray.forEach(msg => toast.error(`${field}: ${msg}`));
          });
          return;
        }
        errorMessage = error.response?.data?.message || 'Data yang dimasukkan tidak valid.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Email atau OTP tidak ditemukan. Silakan ulangi proses reset password.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
      } else if (error.message === 'Network Error' || !error.response) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!emailFromQuery) {
      toast.error('Email tidak ditemukan');
      navigate('/auth/forgot-password');
      return;
    }
  }, [emailFromQuery, navigate]);

  if (passwordReset) {
    return (
      <div className="min-h-screen bg-navy-900 text-white flex items-center justify-center px-3 sm:px-4">
        <div className="w-full max-w-md">
          <header className="bg-navy-900/80 border-b border-white/10 mb-6 sm:mb-8">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-14 sm:h-16 md:h-20 flex items-center">
              <button 
                onClick={() => navigate('/auth/login')} 
                className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base text-white/80 hover:text-white transition-colors font-medium min-h-[44px] touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden sm:inline">Kembali ke Login</span>
                <span className="sm:hidden">Kembali</span>
              </button>
            </div>
          </header>

          <div className="bg-navy-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10 shadow-2xl text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
              Password Berhasil Direset!
            </h1>
            <p className="text-white/70 text-xs sm:text-sm md:text-base mb-5 sm:mb-6">
              Password Anda telah berhasil direset. Silakan login dengan password baru.
            </p>
            <button
              onClick={() => navigate('/auth/login')}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-4 sm:px-6 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-semibold transition-colors min-h-[48px] sm:min-h-[52px] md:min-h-[56px] text-sm sm:text-base touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Masuk ke Akun
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Header */}
      <header className="bg-navy-900/80 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-14 sm:h-16 md:h-20 flex items-center">
          <button 
            onClick={() => navigate('/auth/verify-otp?email=' + encodeURIComponent(emailFromQuery))} 
            className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base text-white/80 hover:text-white transition-colors font-medium min-h-[44px] touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">Kembali</span>
            <span className="sm:hidden">Kembali</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className="w-full max-w-md">
          <div className="bg-navy-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-5 sm:mb-6 md:mb-8">
              <div className="flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                <img 
                  src="/img/logo.png" 
                  alt="E-Kost Manager" 
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                Reset Password
              </h1>
              <p className="text-white/70 text-xs sm:text-sm md:text-base">
                Masukkan password baru Anda
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Hidden fields for email and OTP */}
              <input type="hidden" {...register('email')} />
              <input type="hidden" {...register('otp')} />

              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/80 mb-2 sm:mb-3">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password wajib diisi',
                      minLength: {
                        value: 6,
                        message: 'Password minimal 6 karakter',
                      },
                    })}
                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 md:py-4 pl-11 sm:pl-12 pr-11 sm:pr-12 border border-white/20 rounded-lg sm:rounded-xl bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-sm sm:text-base min-h-[48px] sm:min-h-[52px]"
                    placeholder="Masukkan password baru"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-400 flex items-center gap-1.5 sm:gap-2">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/80 mb-2 sm:mb-3">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('passwordConfirmation', {
                      required: 'Konfirmasi password wajib diisi',
                      validate: (value) =>
                        value === password || 'Password tidak cocok',
                    })}
                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 md:py-4 pl-11 sm:pl-12 pr-11 sm:pr-12 border border-white/20 rounded-lg sm:rounded-xl bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-sm sm:text-base min-h-[48px] sm:min-h-[52px]"
                    placeholder="Konfirmasi password baru"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {errors.passwordConfirmation && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-400 flex items-center gap-1.5 sm:gap-2">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{errors.passwordConfirmation.message}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-4 sm:px-6 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-[52px] md:min-h-[56px] text-sm sm:text-base touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;

